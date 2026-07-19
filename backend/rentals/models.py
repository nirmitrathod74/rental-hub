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
    actual_pickup = models.DateTimeField(blank=True, null=True)
    actual_return_date = models.DateTimeField(blank=True, null=True)
    
    fulfillment_type = models.CharField(max_length=20, choices=FULFILLMENT_CHOICES, default='store_pickup')
    shipping_address = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['status', 'end_date']),
            models.Index(fields=['client', 'status']),
        ]

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


class QuotationTemplate(models.Model):
    name = models.CharField(max_length=100)
    header_text = models.TextField(blank=True, null=True)
    footer_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Review(models.Model):
    rental_order = models.ForeignKey(RentalOrder, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_written')
    reviewee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(default=5) # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['rental_order']),
            models.Index(fields=['reviewer']),
            models.Index(fields=['reviewee']),
        ]

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewee.username} - {self.rating} stars"
