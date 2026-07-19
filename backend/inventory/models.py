from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class RentalPolicy(models.Model):
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
    name = models.CharField(max_length=100)
    security_deposit_type = models.CharField(max_length=20, choices=DEPOSIT_TYPE_CHOICES, default='fixed')
    security_deposit_value = models.DecimalField(max_digits=10, decimal_places=2)
    late_fee_type = models.CharField(max_length=20, choices=LATE_FEE_TYPE_CHOICES, default='daily')
    late_fee_rate = models.DecimalField(max_digits=10, decimal_places=2)
    grace_period_hours = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Product(models.Model):
    APPROVAL_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    CONDITION_CHOICES = (
        ('New', 'New'),
        ('Like New', 'Like New'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
    )
    
    vendor = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='Pending')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='Good')
    pickup_address = models.TextField(blank=True, null=True)

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    product_code = models.CharField(max_length=50, unique=True, db_index=True, null=True, blank=True)
    rental_policy = models.ForeignKey(RentalPolicy, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Inventory (strict 3NF: available_qty removed)
    stock_qty = models.IntegerField(default=0)
    
    class Meta:
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['base_price']),
        ]

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
    PRICE_TYPE_CHOICES = (
        ('discount', 'Discount'),
        ('fixed_price', 'Fixed Price'),
    )
    pricelist = models.ForeignKey(PriceList, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    price_type = models.CharField(max_length=20, choices=PRICE_TYPE_CHOICES, default='discount')
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    custom_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_qty = models.IntegerField(default=0)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    selectable = models.BooleanField(default=True)

    def __str__(self):
        product_name = self.product.name if self.product else "All Products"
        val = f"{self.discount_percentage}%" if self.price_type == 'discount' else f"${self.custom_price}"
        return f"{self.pricelist.name} - {product_name}: {val}"


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

class ProductAvailability(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='blockout_dates')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['product', 'start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.product.name} unavailable from {self.start_date} to {self.end_date}"
