from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    vendor_status = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    business_name = serializers.SerializerMethodField()
    gst_number = serializers.SerializerMethodField()
    product_category = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'vendor_status', 'phone_number', 'address', 'business_name', 'gst_number', 'product_category', 'avatar')
        read_only_fields = ('role', 'vendor_status')

    def get_vendor_status(self, obj):
        if hasattr(obj, 'vendor_profile'):
            return obj.vendor_profile.status
        return None

    def get_phone_number(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.phone_number
        return None

    def get_address(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.address
        return None

    def get_business_name(self, obj):
        if hasattr(obj, 'vendor_profile'):
            return obj.vendor_profile.business_name
        return None

    def get_gst_number(self, obj):
        if hasattr(obj, 'vendor_profile'):
            return obj.vendor_profile.gst_number
        return None

    def get_product_category(self, obj):
        if hasattr(obj, 'vendor_profile'):
            return obj.vendor_profile.product_category
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=(('client', 'Client'), ('vendor', 'Vendor')), default='client')
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    business_name = serializers.CharField(required=False, allow_blank=True)
    gst_number = serializers.CharField(required=False, allow_blank=True)
    product_category = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'password', 'email', 'role', 'phone_number', 'address', 'business_name', 'gst_number', 'product_category')

    def create(self, validated_data):
        from accounts.repositories import UserRepository
        return UserRepository.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['vendor_status'] = user.vendor_profile.status if hasattr(user, 'vendor_profile') else None
        token['email'] = user.email
        return token

    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')
        user_obj = None
        
        if username:
            try:
                if '@' in username:
                    user_obj = User.objects.get(email=username)
                    attrs[self.username_field] = user_obj.username
                else:
                    user_obj = User.objects.get(username=username)
            except User.DoesNotExist:
                pass

        if user_obj and user_obj.check_password(password):
            if user_obj.role == 'vendor' and (not hasattr(user_obj, 'vendor_profile') or user_obj.vendor_profile.status != 'approved'):
                from rest_framework.exceptions import AuthenticationFailed
                raise AuthenticationFailed("Account pending approval")

        try:
            data = super().validate(attrs)
        except Exception as e:
            from rest_framework.exceptions import AuthenticationFailed
            if isinstance(e, AuthenticationFailed):
                # Check if the user exists but is inactive (unverified email)
                if user_obj and not user_obj.is_active:
                    raise AuthenticationFailed("Please verify your email address to activate your account.")
                raise AuthenticationFailed("Invalid username or password")
            raise e

        data['user'] = UserSerializer(self.user).data
        return data
