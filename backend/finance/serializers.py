from rest_framework import serializers
from .models import SecurityDeposit

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
