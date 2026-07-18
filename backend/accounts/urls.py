from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from accounts.views import CustomTokenObtainPairView, RegisterView, ProfileView, AdminVendorViewSet

router = DefaultRouter()
router.register(r'vendors', AdminVendorViewSet, basename='admin-vendors')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='profile_detail'),
] + router.urls
