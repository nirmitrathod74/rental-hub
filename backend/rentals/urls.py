from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rentals.views import RentalOrderViewSet, DashboardViewSet, QuotationTemplateViewSet

router = DefaultRouter()
router.register('orders', RentalOrderViewSet, basename='order')
router.register('dashboard', DashboardViewSet, basename='dashboard')
router.register('templates', QuotationTemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
]
