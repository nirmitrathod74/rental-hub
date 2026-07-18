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

    security_deposit_type = serializers.SerializerMethodField()
    security_deposit_value = serializers.SerializerMethodField()
    late_fee_type = serializers.SerializerMethodField()
    late_fee_rate = serializers.SerializerMethodField()
    grace_period_hours = serializers.SerializerMethodField()
    available_qty = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'product_code', 'category', 'category_detail', 'name', 'sku', 'description', 'image', 'base_price',
            'security_deposit_type', 'security_deposit_value', 'stock_qty',
            'available_qty', 'late_fee_type', 'late_fee_rate', 'grace_period_hours',
            'variants', 'calculated_price', 'calculated_deposit'
        )


    def get_security_deposit_type(self, obj):
        return obj.rental_policy.security_deposit_type if obj.rental_policy else 'fixed'

    def get_security_deposit_value(self, obj):
        return obj.rental_policy.security_deposit_value if obj.rental_policy else 0

    def get_late_fee_type(self, obj):
        return obj.rental_policy.late_fee_type if obj.rental_policy else 'daily'
    
    def get_late_fee_rate(self, obj):
        return obj.rental_policy.late_fee_rate if obj.rental_policy else 0

    def get_grace_period_hours(self, obj):
        return obj.rental_policy.grace_period_hours if obj.rental_policy else 0

    def get_available_qty(self, obj):
        return obj.stock_qty


    def get_calculated_price(self, obj):
        # We can extract pricelist_id from the context if passed
        pricelist_id = self.context.get('pricelist_id')
        return PriceListRepository.get_product_price(obj, pricelist_id)

    def get_calculated_deposit(self, obj):
        pricelist_id = self.context.get('pricelist_id')
        price = PriceListRepository.get_product_price(obj, pricelist_id)
        if obj.rental_policy and obj.rental_policy.security_deposit_type == 'percentage':
            return (obj.rental_policy.security_deposit_value / 100) * price
        return obj.rental_policy.security_deposit_value if obj.rental_policy else 0


class PriceListItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = PriceListItem
        fields = ('id', 'product', 'product_name', 'product_sku', 'custom_price')


class PriceListSerializer(serializers.ModelSerializer):
    items = PriceListItemSerializer(many=True, read_only=True)
    modifiers_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = PriceList
        fields = ('id', 'name', 'is_default', 'start_date', 'end_date', 'items', 'modifiers_count')


class RentalPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalPeriod
        fields = ('id', 'name', 'duration', 'unit')
