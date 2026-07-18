from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from accounts.serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer
)
from accounts.repositories import UserRepository
from accounts.services import UserService

User = get_user_model()

def standard_response(success, message, data=None, errors=None, status_code=200):
    resp = {"success": success, "message": message}
    if success:
        resp["data"] = data or {}
    else:
        resp["errors"] = errors or {}
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
        return standard_response(True, "Registration successful", data=UserSerializer(user).data, status_code=201)

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
