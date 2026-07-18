from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from inventory.models import Category, Product, ProductVariant, PriceList, PriceListItem, RentalPeriod
from inventory.serializers import (
    CategorySerializer, ProductSerializer, PriceListSerializer, PriceListItemSerializer, RentalPeriodSerializer
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


class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.all().order_by('id')
    serializer_class = PriceListSerializer
    permission_classes = (IsAdminOrReadOnly,)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_item(self, request, pk=None):
        pricelist = self.get_object()
        product_id = request.data.get('product')
        price = request.data.get('custom_price')
        
        if not product_id or not price:
            return Response({'error': 'product and custom_price required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'product not found'}, status=status.HTTP_404_NOT_FOUND)
            
        item, created = PriceListItem.objects.update_or_create(
            pricelist=pricelist,
            product=product,
            defaults={'custom_price': price}
        )
        serializer = PriceListItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class RentalPeriodViewSet(viewsets.ModelViewSet):
    queryset = RentalPeriod.objects.all().order_by('id')
    serializer_class = RentalPeriodSerializer
    permission_classes = (IsAdminOrReadOnly,)
