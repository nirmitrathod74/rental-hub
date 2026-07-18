from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),
    )
    VENDOR_STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    vendor_status = models.CharField(max_length=20, choices=VENDOR_STATUS_CHOICES, default='pending', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    business_name = models.CharField(max_length=200, blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    product_category = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    @property
    def is_admin_role(self):
        return self.role == 'admin' or self.is_superuser

    @property
    def is_approved_vendor(self):
        return self.role == 'vendor' and self.vendor_status == 'approved'
