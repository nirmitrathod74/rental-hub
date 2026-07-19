from rest_framework import serializers
from .models import SecurityDeposit, PlatformRevenue

class SecurityDepositSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = SecurityDeposit
        fields = ('id', 'order', 'order_number', 'customer_name', 'amount', 'status', 'penalty_deducted', 'updated_at')
        read_only_fields = ('updated_at',)

    def get_customer_name(self, obj):
        try:
            return obj.order.customer.user.get_full_name() or obj.order.customer.user.username
        except AttributeError:
            return "Unknown Customer"

class PlatformRevenueSerializer(serializers.ModelSerializer):
    order_public_id = serializers.CharField(source='order.public_id', read_only=True)
    
    class Meta:
        model = PlatformRevenue
        fields = ('id', 'order', 'order_public_id', 'rental_fee', 'platform_commission', 'vendor_payout', 'is_paid_out', 'created_at')
