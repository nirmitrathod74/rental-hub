from django.contrib.auth import get_user_model
from accounts.models import UserProfile, VendorProfile

User = get_user_model()

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_by_username(username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @staticmethod
    def create_user(username, password, email=None, role='client', **extra_fields):
        # Extract profile fields
        phone_number = extra_fields.pop('phone_number', None)
        address = extra_fields.pop('address', None)
        
        # Extract vendor fields
        business_name = extra_fields.pop('business_name', None)
        gst_number = extra_fields.pop('gst_number', None)
        product_category = extra_fields.pop('product_category', None)
        vendor_status = extra_fields.pop('vendor_status', 'pending')

        user = User(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save()

        # Create Profile
        UserProfile.objects.create(
            user=user,
            phone_number=phone_number,
            address=address
        )

        # Create Vendor Profile if applicable
        if role == 'vendor':
            VendorProfile.objects.create(
                user=user,
                status=vendor_status,
                business_name=business_name,
                gst_number=gst_number,
                product_category=product_category
            )

        return user

    @staticmethod
    def get_pending_vendors():
        return User.objects.filter(role='vendor', vendor_profile__status='pending').order_by('-date_joined')

    @staticmethod
    def update_profile(user, **fields):
        # Not fully generic anymore, but simple for now
        profile = getattr(user, 'profile', None)
        vendor_profile = getattr(user, 'vendor_profile', None)
        
        for field, value in fields.items():
            if hasattr(user, field):
                setattr(user, field, value)
            elif profile and hasattr(profile, field):
                setattr(profile, field, value)
            elif vendor_profile and hasattr(vendor_profile, field):
                setattr(vendor_profile, field, value)
                
        user.save()
        if profile:
            profile.save()
        if vendor_profile:
            vendor_profile.save()
        return user
