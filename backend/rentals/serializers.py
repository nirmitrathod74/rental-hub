from rest_framework import serializers
from rentals.models import RentalOrder, RentalItem, RentalInspection, DepositHistory, QuotationTemplate
from inventory.serializers import ProductSerializer
from accounts.serializers import UserSerializer

class RentalItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = RentalItem
        fields = ('id', 'product', 'product_details', 'quantity', 'unit_price', 'deposit_amount', 'selected_variants')


class DepositHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositHistory
        fields = ('id', 'amount', 'transaction_type', 'created_at', 'notes')


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
    deposit_history = DepositHistorySerializer(many=True, read_only=True)
    inspections = RentalInspectionSerializer(many=True, read_only=True)
    client_details = UserSerializer(source='client', read_only=True)

    class Meta:
        model = RentalOrder
        fields = (
            'id', 'client', 'client_details', 'status', 'start_date', 'end_date', 'actual_return_date',
            'fulfillment_type', 'shipping_address', 'total_rent_amount', 'total_deposit_amount',
            'amount_paid', 'deposit_paid', 'deposit_refunded', 'late_fee_charged',
            'items', 'deposit_history', 'inspections', 'created_at', 'updated_at'
        )
        read_only_fields = ('status', 'total_rent_amount', 'total_deposit_amount', 'amount_paid', 'deposit_paid', 'deposit_refunded', 'late_fee_charged')


class QuotationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationTemplate
        fields = ('id', 'name', 'header_text', 'footer_text')
