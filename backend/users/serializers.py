from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    order_count = serializers.SerializerMethodField()
    wishlist_count = serializers.SerializerMethodField()
    coupon_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'email', 'first_name', 'last_name',
            'avatar', 'is_verified', 'first_order', 'created_at',
            'order_count', 'wishlist_count', 'coupon_count'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_order_count(self, obj):
        """Get the count of non-deleted orders for this user."""
        from orders.models import Order
        return Order.objects.filter(user=obj, is_deleted=False).count()

    def get_wishlist_count(self, obj):
        """Get the count of non-deleted wishlist items for this user."""
        from wishlist.models import WishlistItem
        return WishlistItem.objects.filter(user=obj, is_deleted=False).count()

    def get_coupon_count(self, obj):
        """Get the count of coupons used by this user."""
        from coupons.models import CouponUsage
        return CouponUsage.objects.filter(user=obj, is_deleted=False).count()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['phone', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        # Check password confirmation
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match")
        
        # Ensure phone is 10 digits
        if not data['phone'].isdigit() or len(data['phone']) != 10:
            raise serializers.ValidationError("Phone must be 10 digits")
        
        return data
    
    def create(self, validated_data):
        # Remove password_confirm from validated data
        validated_data.pop('password_confirm')
        
        # Extract password
        password = validated_data.pop('password')
        
        validated_data.setdefault('username', validated_data.get('phone'))
        
        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate_phone(self, value):
        # Remove any non-digit characters from phone
        return ''.join(filter(str.isdigit, value))
    
    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')
        
        if not phone or not password:
            raise serializers.ValidationError("Phone and password are required")
        
        # Check if user exists
        if not User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Invalid credentials")
        
        return data