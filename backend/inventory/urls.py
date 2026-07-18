from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.views import CategoryViewSet, ProductViewSet, PriceListViewSet, RentalPeriodViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('pricelists', PriceListViewSet, basename='pricelist')
router.register('periods', RentalPeriodViewSet, basename='period')

urlpatterns = [
    path('', include(router.urls)),
]
