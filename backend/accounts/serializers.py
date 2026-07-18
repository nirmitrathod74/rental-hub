from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'vendor_status', 'phone_number', 'address', 'business_name', 'gst_number', 'product_category', 'avatar')
        read_only_fields = ('role', 'vendor_status')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=(('client', 'Client'), ('vendor', 'Vendor')), default='client')

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'password', 'email', 'role', 'phone_number', 'address', 'business_name', 'gst_number', 'product_category')

    def create(self, validated_data):
        if validated_data.get('role') == 'vendor':
            validated_data['vendor_status'] = 'pending'
        from accounts.repositories import UserRepository
        return UserRepository.create_user(**validated_data)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['vendor_status'] = user.vendor_status
        token['email'] = user.email
        return token

    def validate(self, attrs):
        username = attrs.get(self.username_field)
        if username and '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        if self.user.role == 'vendor' and self.user.vendor_status != 'approved':
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Account pending approval")
        data['user'] = UserSerializer(self.user).data
        return data
