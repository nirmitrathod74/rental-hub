from django.db import models

class Product(models.Model):
    DEPOSIT_TYPE_CHOICES = (
        ('fixed', 'Fixed Amount'),
        ('percentage', 'Percentage of Rent'),
    )
    LATE_FEE_TYPE_CHOICES = (
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    )
    
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Security Deposit
    security_deposit_type = models.CharField(max_length=20, choices=DEPOSIT_TYPE_CHOICES, default='fixed')
    security_deposit_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Inventory
    stock_qty = models.IntegerField(default=0)
    available_qty = models.IntegerField(default=0)
    
    # Late Return Penalty Rules
    late_fee_type = models.CharField(max_length=20, choices=LATE_FEE_TYPE_CHOICES, default='daily')
    late_fee_rate = models.DecimalField(max_digits=10, decimal_places=2)
    grace_period_hours = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    attribute_name = models.CharField(max_length=100) # e.g. Color, Brand, Manufacturer, Size
    attribute_value = models.CharField(max_length=100) # e.g. Red, Odoo, L

    def __str__(self):
        return f"{self.product.name} - {self.attribute_name}: {self.attribute_value}"


class PriceList(models.Model):
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.name


class PriceListItem(models.Model):
    pricelist = models.ForeignKey(PriceList, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    custom_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('pricelist', 'product')

    def __str__(self):
        return f"{self.pricelist.name} - {self.product.name}: ${self.custom_price}"


class RentalPeriod(models.Model):
    name = models.CharField(max_length=100)
    duration_days = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.duration_days} Days)"
