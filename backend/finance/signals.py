from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from .models import Payment, PlatformRevenue, PlatformSettings

@receiver(post_save, sender=Payment)
def calculate_revenue_split(sender, instance, created, **kwargs):
    if instance.status == 'paid' and instance.payment_type == 'rental':
        # Check if revenue split already exists
        if not hasattr(instance.rental_order, 'revenue_split'):
            settings = PlatformSettings.get_settings()
            platform_percentage = settings.platform_commission_percentage
            
            rental_fee = instance.amount # Assuming this payment is strictly the rental fee as per user constraint
            
            platform_commission = rental_fee * (platform_percentage / Decimal('100.0'))
            vendor_payout = rental_fee - platform_commission
            
            PlatformRevenue.objects.create(
                order=instance.rental_order,
                rental_fee=rental_fee,
                platform_commission=platform_commission,
                vendor_payout=vendor_payout
            )
