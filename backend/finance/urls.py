from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SecurityDepositViewSet, VendorPayoutsAPIView

router = DefaultRouter()
router.register(r'', SecurityDepositViewSet, basename='security-deposit')

urlpatterns = [
    path('vendor-payouts/', VendorPayoutsAPIView.as_view(), name='vendor-payouts'),
    path('', include(router.urls)),
]
