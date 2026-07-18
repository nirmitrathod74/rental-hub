from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SecurityDepositViewSet

router = DefaultRouter()
router.register(r'', SecurityDepositViewSet, basename='security-deposit')

urlpatterns = [
    path('', include(router.urls)),
]
