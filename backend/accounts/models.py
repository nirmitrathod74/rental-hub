from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client', db_index=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    @property
    def is_admin_role(self):
        return self.role == 'admin' or self.is_superuser

    @property
    def is_approved_vendor(self):
        if self.role == 'vendor' and hasattr(self, 'vendor_profile'):
            return self.vendor_profile.status == 'approved'
        return False


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class VendorProfile(models.Model):
    VENDOR_STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    status = models.CharField(max_length=20, choices=VENDOR_STATUS_CHOICES, default='pending', db_index=True)
    business_name = models.CharField(max_length=200, blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    product_category = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Vendor Profile: {self.business_name or self.user.username}"
