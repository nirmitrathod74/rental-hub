import uuid
from django.db import models
from django.conf import settings
from inventory.models import Product

class RentalOrder(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft / Quotation'),
        ('confirmed', 'Confirmed'),
        ('picked_up', 'Picked Up'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
        ('settled', 'Settled / Closed'),
        ('cancelled', 'Cancelled'),
    )
    
    FULFILLMENT_CHOICES = (
        ('delivery', 'Delivery'),
        ('store_pickup', 'Store Pickup'),
    )

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rentals')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    actual_return_date = models.DateTimeField(blank=True, null=True)
    
    fulfillment_type = models.CharField(max_length=20, choices=FULFILLMENT_CHOICES, default='store_pickup')
    shipping_address = models.TextField(blank=True, null=True)
    
    # Financial breakdowns
    total_rent_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deposit_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deposit_refunded = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    late_fee_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.client.username} ({self.status})"


class RentalItem(models.Model):
    rental_order = models.ForeignKey(RentalOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    selected_variants = models.JSONField(blank=True, null=True) # e.g. {"Color": "Blue", "Size": "M"}

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (Order #{self.rental_order.id})"


class RentalInspection(models.Model):
    CONDITION_CHOICES = (
        ('good', 'Good Condition'),
        ('damaged', 'Damaged'),
        ('needs_repair', 'Needs Repair'),
    )

    rental_order = models.ForeignKey(RentalOrder, on_delete=models.CASCADE, related_name='inspections')
    inspector = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inspected_orders')
    inspection_date = models.DateTimeField(auto_now_add=True)
    condition_rating = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    damage_notes = models.TextField(blank=True, null=True)
    missing_accessories = models.TextField(blank=True, null=True)
    repair_initiated = models.BooleanField(default=False)

    def __str__(self):
        return f"Inspection for Order #{self.rental_order.id} ({self.condition_rating})"


class DepositHistory(models.Model):
    TX_TYPE_CHOICES = (
        ('collect', 'Collection'),
        ('refund', 'Refund'),
        ('deduct', 'Deduction'),
    )

    rental_order = models.ForeignKey(RentalOrder, on_delete=models.CASCADE, related_name='deposit_history')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TX_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.transaction_type.upper()}: ${self.amount} for Order #{self.rental_order.id}"


class QuotationTemplate(models.Model):
    name = models.CharField(max_length=100)
    header_text = models.TextField(blank=True, null=True)
    footer_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
