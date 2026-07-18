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
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return standard_response(False, "Validation failed", errors=serializer.errors, status_code=400)
        user = serializer.save()
        user.is_active = False
        user.save()
        try:
            send_verification_email(user)
        except Exception as e:
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


class CustomerViewSet(viewsets.ModelViewSet):
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
        return standard_response(True, "Customer created", data=UserSerializer(user).data, status_code=201)


class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '')
        if not email:
            return standard_response(False, "Email is required", status_code=400)
        
        try:
            users = User.objects.filter(email=email, is_active=True)
            if users.exists():
                for user in users:
                    send_password_reset_email(user)
            # Prevent user enumeration by returning success regardless
            return standard_response(True, "If an account matches that email, we have sent instructions to reset your password.")
        except Exception as e:
            return standard_response(False, str(e), status_code=400)


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        
        if not uidb64 or not token or not new_password:
            return standard_response(False, "Missing required fields", status_code=400)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return standard_response(True, "Password has been reset successfully.")
        else:
            return standard_response(False, "The reset link is invalid or has expired.", status_code=400)


class VerifyEmailView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        uidb64 = request.GET.get('uid', '')
        token = request.GET.get('token', '')
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect(f"{settings.FRONTEND_URL}/login?verified=true")
        else:
            return redirect(f"{settings.FRONTEND_URL}/login?verified=false")

