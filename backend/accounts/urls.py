from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from accounts.views import (
    RegisterView, ProfileView, CustomTokenObtainPairView, AdminVendorViewSet, CustomerViewSet
)

router = DefaultRouter()
router.register('vendors', AdminVendorViewSet, basename='vendor')
router.register('customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='profile_detail'),
] + router.urls
