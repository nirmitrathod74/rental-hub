from rest_framework import serializers
from inventory.models import Category, Product, ProductVariant, PriceList, PriceListItem, RentalPeriod
from inventory.services import InventoryService
from inventory.repositories import PriceListRepository

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description')


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('id', 'attribute_name', 'attribute_value')

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), write_only=True, required=False, allow_null=True
    )
    calculated_price = serializers.SerializerMethodField()
    calculated_deposit = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'category_detail', 'name', 'sku', 'description', 'image', 'base_price',
            'security_deposit_type', 'security_deposit_value', 'stock_qty',
            'available_qty', 'late_fee_type', 'late_fee_rate', 'grace_period_hours',
            'variants', 'calculated_price', 'calculated_deposit'
        )

    def get_calculated_price(self, obj):
        # We can extract pricelist_id from the context if passed
        pricelist_id = self.context.get('pricelist_id')
        return PriceListRepository.get_product_price(obj, pricelist_id)

    def get_calculated_deposit(self, obj):
        pricelist_id = self.context.get('pricelist_id')
        price = PriceListRepository.get_product_price(obj, pricelist_id)
        if obj.security_deposit_type == 'percentage':
            return (obj.security_deposit_value / 100) * price
        return obj.security_deposit_value


class PriceListItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = PriceListItem
        fields = ('id', 'product', 'product_name', 'product_sku', 'custom_price')


class PriceListSerializer(serializers.ModelSerializer):
    items = PriceListItemSerializer(many=True, read_only=True)

    class Meta:
        model = PriceList
        fields = ('id', 'name', 'is_default', 'start_date', 'end_date', 'items')


class RentalPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalPeriod
        fields = ('id', 'name', 'duration_days')
