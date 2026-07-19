from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from inventory.models import Category, Product, ProductVariant, PriceList, PriceListItem, RentalPeriod
from inventory.serializers import (
    CategorySerializer, ProductSerializer, PriceListSerializer, PriceListItemSerializer, RentalPeriodSerializer,
    VendorProductSerializer
)
from inventory.repositories import ProductRepository
from inventory.services import InventoryService

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and getattr(request.user, 'is_admin_role', False)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Allow client to supply pricelist query param
        pricelist_id = self.request.query_params.get('pricelist_id')
        if pricelist_id:
            context['pricelist_id'] = pricelist_id
        return context

    def list(self, request, *args, **kwargs):
        # Auto-seed images if any product is missing an image or has the ugly red test_img
        invalid_images = Product.objects.filter(image='').exists() or \
                         Product.objects.filter(image__isnull=True).exists() or \
                         Product.objects.filter(image='products/test_img.jpg').exists()
        
        if invalid_images:
            import os
            from django.conf import settings
            # We have two premium images, let's alternate them based on product ID for variety
            unsplash1 = "products/borna-bevanda-CsbWQx1rzJI-unsplash.jpg"
            unsplash2 = "products/jonatan-pie-EOoa3D1N0xc-unsplash.jpg"
            
            for p in Product.objects.all():
                if not p.image or p.image.name == 'products/test_img.jpg':
                    image_name = f"{p.sku.lower()}.png"
                    image_path = os.path.join(settings.MEDIA_ROOT, 'products', image_name)
                    if os.path.exists(image_path):
                        p.image = f"products/{image_name}"
                    else:
                        p.image = unsplash1 if p.id % 2 == 0 else unsplash2
                    p.save()
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Support bulk creating product + variants in service layer
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        
        # Inject defaults for fields not provided by the minimal Add Product form
        if 'security_deposit_value' not in data:
            data['security_deposit_value'] = '0.00'
        if 'late_fee_rate' not in data:
            data['late_fee_rate'] = '0.00'
        
        # In multipart/form-data, variants might be a stringified JSON list, or just missing
        variants_data = data.pop('variants', [])
        if not isinstance(variants_data, list):
            # If it's a string from form-data, we could parse it, but for now just default to []
            variants_data = []

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Call service layer
        product = InventoryService.create_product(serializer.validated_data, variants_data)
        
        result_serializer = self.get_serializer(product)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        if 'category' in data and not data['category']:
            data['category'] = None
            
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        # Use service layer
        product = InventoryService.update_product(instance, serializer.validated_data)
        return Response(self.get_serializer(product).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        InventoryService.delete_product(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_variant(self, request, pk=None):
        product = self.get_object()
        attr_name = request.data.get('attribute_name')
        attr_value = request.data.get('attribute_value')
        if not attr_name or not attr_value:
            return Response({'error': 'attribute_name and attribute_value required'}, status=status.HTTP_400_BAD_REQUEST)
        
        variant = ProductVariant.objects.create(
            product=product,
            attribute_name=attr_name,
            attribute_value=attr_value
        )
        return Response({
            'id': variant.id,
            'attribute_name': variant.attribute_name,
            'attribute_value': variant.attribute_value
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        product = self.get_object()
        if not product.product_code:
            return Response({'error': 'Product code not generated yet.'}, status=status.HTTP_400_BAD_REQUEST)
        
        import qrcode
        from io import BytesIO
        from django.http import HttpResponse
        from django.conf import settings

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        qr_url = f"{frontend_url.rstrip('/')}/scan/{product.product_code}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return HttpResponse(buffer.getvalue(), content_type="image/png")

    @action(detail=True, methods=['get'], url_path='qr/download')
    def download_qr(self, request, pk=None):
        product = self.get_object()
        if not product.product_code:
            return Response({'error': 'Product code not generated yet.'}, status=status.HTTP_400_BAD_REQUEST)
        
        import qrcode
        from io import BytesIO
        from django.http import HttpResponse
        from django.conf import settings

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        qr_url = f"{frontend_url.rstrip('/')}/scan/{product.product_code}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        response = HttpResponse(buffer.getvalue(), content_type="image/png")
        response['Content-Disposition'] = f'attachment; filename="{product.product_code}.png"'
        return response

    @action(detail=False, methods=['get'], url_path='by-code/(?P<product_code>[a-zA-Z0-9-]+)')
    def by_code(self, request, product_code=None):
        try:
            product = Product.objects.get(product_code=product_code)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)



class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.all().order_by('id')
    serializer_class = PriceListSerializer
    permission_classes = (IsAdminOrReadOnly,)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_item(self, request, pk=None):
        pricelist = self.get_object()
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        data['pricelist'] = pricelist.id
        
        # In case frontend passes empty string for product (All Products)
        if data.get('product') == '':
            data['product'] = None
            
        serializer = PriceListItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PriceListItemViewSet(viewsets.ModelViewSet):
    queryset = PriceListItem.objects.all().order_by('id')
    serializer_class = PriceListItemSerializer
    permission_classes = (IsAdminOrReadOnly,)

class RentalPeriodViewSet(viewsets.ModelViewSet):
    queryset = RentalPeriod.objects.all().order_by('id')
    serializer_class = RentalPeriodSerializer
    permission_classes = (IsAdminOrReadOnly,)

class VendorProductViewSet(viewsets.ModelViewSet):
    serializer_class = VendorProductSerializer
    permission_classes = (permissions.IsAuthenticated,)
    from rest_framework.parsers import MultiPartParser, FormParser
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user, approval_status='Pending')

from rest_framework.views import APIView

class AdminProductApprovalAPIView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request, *args, **kwargs):
        pending = Product.objects.filter(approval_status='Pending')
        serializer = VendorProductSerializer(pending, many=True)
        return Response(serializer.data)

    def patch(self, request, pk, *args, **kwargs):
        try:
            product = Product.objects.get(pk=pk, approval_status='Pending')
        except Product.DoesNotExist:
            return Response({'error': 'Pending product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('approval_status')
        if new_status not in ['Approved', 'Rejected']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        product.approval_status = new_status
        product.save()
        return Response({'status': 'success', 'approval_status': new_status})

class VendorDashboardStatsAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        from django.core.cache import cache
        from finance.models import PlatformRevenue
        from rentals.models import RentalOrder
        
        user = request.user
        cache_key = f'vendor_stats_{user.id}'
        stats = cache.get(cache_key)

        if not stats:
            vendor_products = Product.objects.filter(vendor=user)
            pending_approvals = vendor_products.filter(approval_status='Pending').count()
            
            # Active rentals
            active_rentals = RentalOrder.objects.filter(
                items__product__in=vendor_products,
                status__in=['confirmed', 'picked_up', 'overdue']
            ).distinct().count()

            # Total Earnings
            revenues = PlatformRevenue.objects.filter(order__items__product__in=vendor_products).distinct()
            total_earnings = sum(rev.vendor_payout for rev in revenues)

            stats = {
                'total_earnings': float(total_earnings),
                'active_rentals': active_rentals,
                'pending_approvals': pending_approvals,
            }
            cache.set(cache_key, stats, timeout=300) # Cache for 5 minutes

        return Response(stats)

