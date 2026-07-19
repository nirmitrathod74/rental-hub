import uuid
from django.db import models
from rentals.models import RentalOrder


class Payment(models.Model):
    TYPES = (('rental', 'Rental'), ('deposit', 'Deposit'), ('refund', 'Refund'), ('late_fee', 'Late fee'))
    STATUS = (('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded'))
    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    rental_order = models.ForeignKey(RentalOrder, on_delete=models.PROTECT, related_name='payments')
    payment_type = models.CharField(max_length=16, choices=TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=16, choices=STATUS, default='pending')
    provider = models.CharField(max_length=40, default='manual')
    provider_reference = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    settled_at = models.DateTimeField(blank=True, null=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['rental_order', 'status']),
            models.Index(fields=['payment_type', 'status', 'created_at']),
        ]


class Invoice(models.Model):
    STATUS = (('draft', 'Draft'), ('issued', 'Issued'), ('paid', 'Paid'), ('void', 'Void'))
    number = models.CharField(max_length=32, unique=True)
    rental_order = models.ForeignKey(RentalOrder, on_delete=models.PROTECT, related_name='invoices')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=16, choices=STATUS, default='draft')
    issued_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SecurityDeposit(models.Model):
    STATUS_CHOICES = (
        ('Held', 'Held'),
        ('Refunded', 'Refunded'),
        ('Partial Deduction', 'Partial Deduction')
    )
    order = models.ForeignKey(RentalOrder, on_delete=models.PROTECT, related_name='security_deposits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Held')
    penalty_deducted = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['order', 'status']),
        ]

    def __str__(self):
        return f"Deposit for Order {self.order.order_number} - {self.status}"

class PlatformSettings(models.Model):
    platform_commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.__class__.objects.count():
            self.pk = self.__class__.objects.first().pk
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"Platform Settings ({self.platform_commission_percentage}%)"

class PlatformRevenue(models.Model):
    order = models.OneToOneField(RentalOrder, on_delete=models.CASCADE, related_name='revenue_split')
    rental_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    vendor_payout = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid_out = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Revenue Split for Order {self.order.id} - Platform: {self.platform_commission}, Vendor: {self.vendor_payout}"

