from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.shortcuts import redirect
from accounts.serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer
)
from accounts.repositories import UserRepository
from accounts.services import UserService
from accounts.utils import send_password_reset_email, send_verification_email

User = get_user_model()

def standard_response(success, message, data=None, errors=None, status_code=200):
    resp = {"success": success, "message": message}
    if success:
        resp["data"] = data if data is not None else {}
    else:
        resp["errors"] = errors if errors is not None else {}
    return Response(resp, status=status_code)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    def create(self, request, *args, **kwargs):
        # Validate incoming registration payload
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return standard_response(False, "Validation failed", errors=serializer.errors, status_code=400)
        
        # Save the new user record in the database
        user = serializer.save()
        
        # Deactivate user account immediately (is_active = False) so they cannot sign in 
        # until their email address is verified
        user.is_active = False
        user.save()
        
        # Trigger email verification asynchronously/synchronously
        try:
            send_verification_email(user)
        except Exception as e:
            # If SMTP fails, we catch it silently so the HTTP request doesn't crash 500
            pass
            
        return standard_response(True, "Registration successful. Please check your email to verify your account.", data=UserSerializer(user).data, status_code=201)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return standard_response(True, "Profile retrieved", data=serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return standard_response(False, "Validation failed", errors=serializer.errors, status_code=400)
        
        UserRepository.update_profile(instance, **serializer.validated_data)
        return standard_response(True, "Profile updated", data=serializer.data)

class AdminVendorViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def check_admin(self, request):
        if not request.user.is_admin_role:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Admin access required")

    @action(detail=False, methods=['get'])
    def pending(self, request):
        self.check_admin(request)
        vendors = UserRepository.get_pending_vendors()
        serializer = UserSerializer(vendors, many=True)
        return standard_response(True, "Pending vendors retrieved", data=serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        self.check_admin(request)
        try:
            user = UserService.approve_vendor(pk)
            return standard_response(True, "Vendor approved", data=UserSerializer(user).data)
        except Exception as e:
            return standard_response(False, str(e), status_code=400)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        self.check_admin(request)
        try:
            user = UserService.reject_vendor(pk)
            return standard_response(True, "Vendor rejected", data=UserSerializer(user).data)
        except Exception as e:
            return standard_response(False, str(e), status_code=400)


class ClientViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_queryset(self):
        # Only admins should access this
        if not self.request.user.is_admin_role:
            return User.objects.none()
        return User.objects.filter(role='client').order_by('-date_joined')

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin_role:
            return standard_response(False, "Unauthorized", status_code=403)
        # Force role to client
        data = request.data.copy()
        data['role'] = 'client'
        # We use RegisterSerializer to handle password creation properly
        serializer = RegisterSerializer(data=data)
        if not serializer.is_valid():
            return standard_response(False, "Validation failed", errors=serializer.errors, status_code=400)
        user = serializer.save()
        return standard_response(True, "Client created", data=UserSerializer(user).data, status_code=201)


# --- PASSWORD RESET FLOW VIEWS ---

class PasswordResetRequestView(APIView):
    """
    Accepts user email, finds active account(s) matching the email,
    and dispatches a password recovery token link.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '')
        if not email:
            return standard_response(False, "Email is required", status_code=400)
        
        try:
            # Query all users matching this email address (including inactive/unverified)
            users = User.objects.filter(email=email)
            if users.exists():
                for user in users:
                    send_password_reset_email(user)
            # Security Best Practice: Return a success message even if email is not found
            # to prevent malicious actors from guessing/harvesting registered email addresses (user enumeration).
            return standard_response(True, "If an account matches that email, we have sent instructions to reset your password.")
        except Exception as e:
            return standard_response(False, str(e), status_code=400)


class PasswordResetConfirmView(APIView):
    """
    Accepts the uid and cryptographic token alongside the user's new password,
    validates the link authenticity/timelimit, and resets their password.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        
        if not uidb64 or not token or not new_password:
            return standard_response(False, "Missing required fields", status_code=400)
            
        try:
            # Decode the base64 encoded user ID back into standard format
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        # Verify the signature match and that the token is valid for this user
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            # Also activate the account — resetting password via email link
            # proves the user owns the email address (secondary verification)
            user.is_active = True
            user.save()
            return standard_response(True, "Password has been reset successfully.")
        else:
            return standard_response(False, "The reset link is invalid or has expired.", status_code=400)


# --- REGISTRATION EMAIL VERIFICATION VIEW ---

class VerifyEmailView(APIView):
    """
    Acts as the entry endpoint when users click their email verification link.
    Validates token, activates account (is_active = True), and redirects to login with success parameters.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        uidb64 = request.GET.get('uid', '')
        token = request.GET.get('token', '')
        try:
            # Decode base64 encoded user ID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        # Verify the token signature. If valid, activate user.
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            # Redirect user back to React login page with verified=true parameter
            return redirect(f"{settings.FRONTEND_URL}/login?verified=true")
        else:
            # Redirect user back to React login page with verified=false (failed/expired)
            return redirect(f"{settings.FRONTEND_URL}/login?verified=false")


# --- CONTACT US MAIL DISPATCH VIEW ---

class ContactMessageView(APIView):
    """
    Accepts contact queries submitted from the website's Contact Us page,
    formats them into an email message, and sends it to the server host administrator.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        name = request.data.get('name', '')
        email = request.data.get('email', '')
        subject = request.data.get('subject', '')
        message = request.data.get('message', '')

        if not name or not email or not subject or not message:
            return standard_response(False, "Missing required fields", status_code=400)

        # Recipient is the EMAIL_HOST_USER defined in .env
        recipient = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
        
        email_subject = f"Contact Message: {subject}"
        email_message = f"""
You have received a new contact message from your website.

Sender Name: {name}
Sender Email: {email}
Subject: {subject}

Message:
{message}
"""
        from django.core.mail import send_mail
        try:
            send_mail(
                email_subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=False,
            )
            return standard_response(True, "Your message has been sent successfully.")
        except Exception as e:
            return standard_response(False, f"Failed to send email: {str(e)}", status_code=500)


