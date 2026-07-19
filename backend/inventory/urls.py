from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.views import (
    CategoryViewSet, ProductViewSet, PriceListViewSet, PriceListItemViewSet, RentalPeriodViewSet,
    VendorProductViewSet, AdminProductApprovalAPIView, VendorDashboardStatsAPIView
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('pricelists', PriceListViewSet, basename='pricelist')
router.register('pricelist-items', PriceListItemViewSet, basename='pricelist-items')
router.register('periods', RentalPeriodViewSet, basename='period')

router.register('vendor-products', VendorProductViewSet, basename='vendor-product')

urlpatterns = [
    path('vendor/stats/', VendorDashboardStatsAPIView.as_view(), name='vendor-stats'),
    path('admin/product-approvals/', AdminProductApprovalAPIView.as_view(), name='admin-product-approvals-list'),
    path('admin/product-approvals/<int:pk>/', AdminProductApprovalAPIView.as_view(), name='admin-product-approvals-detail'),
    path('', include(router.urls)),
]
