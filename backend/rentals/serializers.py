from rest_framework import serializers
from rentals.models import RentalOrder, RentalItem, RentalInspection, QuotationTemplate
from inventory.serializers import ProductSerializer
from accounts.serializers import UserSerializer

class RentalItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = RentalItem
        fields = ('id', 'product', 'product_details', 'quantity', 'unit_price', 'deposit_amount', 'selected_variants')

class RentalInspectionSerializer(serializers.ModelSerializer):
    inspector_details = UserSerializer(source='inspector', read_only=True)

    class Meta:
        model = RentalInspection
        fields = (
            'id', 'inspector', 'inspector_details', 'inspection_date',
            'condition_rating', 'damage_notes', 'missing_accessories', 'repair_initiated'
        )

class RentalOrderSerializer(serializers.ModelSerializer):
    items = RentalItemSerializer(many=True, read_only=True)
    inspections = RentalInspectionSerializer(many=True, read_only=True)
    client_details = UserSerializer(source='client', read_only=True)
    
    total_rent_amount = serializers.SerializerMethodField()
    total_deposit_amount = serializers.SerializerMethodField()

    class Meta:
        model = RentalOrder
        fields = (
            'id', 'public_id', 'client', 'client_details', 'status', 'start_date', 'end_date', 'actual_return_date',
            'fulfillment_type', 'shipping_address', 'items', 'inspections', 'created_at', 'updated_at',
            'total_rent_amount', 'total_deposit_amount'
        )
        read_only_fields = ('public_id', 'status')
        
    def get_total_rent_amount(self, obj):
        return sum((item.quantity * item.unit_price) for item in obj.items.all())
        
    def get_total_deposit_amount(self, obj):
        return sum((item.quantity * item.deposit_amount) for item in obj.items.all())

class QuotationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationTemplate
        fields = ('id', 'name', 'header_text', 'footer_text')
