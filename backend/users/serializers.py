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
            'id', 'phone', 'email', 'first_name', 'last_name', 'address',
            'avatar', 'is_verified', 'first_order', 'created_at',
            'order_count', 'wishlist_count', 'coupon_count',
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_order_count(self, obj):
        return obj.orders.filter(is_deleted=False).count()

    def get_wishlist_count(self, obj):
        return obj.wishlist_items.filter(is_deleted=False).count()

    def get_coupon_count(self, obj):
        return obj.coupon_usages.filter(is_deleted=False).count()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['phone', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match")

        if not data['phone'].isdigit() or len(data['phone']) != 10:
            raise serializers.ValidationError("Phone must be 10 digits")

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        validated_data.setdefault('username', validated_data.get('phone'))
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_phone(self, value):
        return ''.join(filter(str.isdigit, value))

    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')

        if not phone or not password:
            raise serializers.ValidationError("Phone and password are required")

        if not User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Invalid credentials")

        return data
