from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


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
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    product_code = models.CharField(max_length=50, unique=True, db_index=True, null=True, blank=True)
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

    def save(self, *args, **kwargs):
        if self.pk:
            # Enforce that product_code is read-only after creation
            original = Product.objects.get(pk=self.pk)
            if original.product_code and original.product_code != self.product_code:
                self.product_code = original.product_code
        
        if not self.product_code:
            import re
            last_product = Product.objects.filter(product_code__regex=r'^PRD-\d+$').order_by('-product_code').first()
            if last_product and last_product.product_code:
                match = re.match(r'^PRD-(\d+)$', last_product.product_code)
                if match:
                    next_number = int(match.group(1)) + 1
                else:
                    next_number = 1
            else:
                next_number = 1
            
            while True:
                code = f"PRD-{next_number:06d}"
                if not Product.objects.filter(product_code=code).exists():
                    self.product_code = code
                    break
                next_number += 1

        super().save(*args, **kwargs)

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

    @property
    def modifiers_count(self):
        return self.items.count()

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
    UNIT_CHOICES = (
        ('Hours', 'Hours'),
        ('Days', 'Days'),
        ('Weeks', 'Weeks'),
        ('Months', 'Months'),
    )
    name = models.CharField(max_length=100)
    duration = models.IntegerField(default=1)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='Days')

    def __str__(self):
        return f"{self.name} ({self.duration} {self.unit})"
