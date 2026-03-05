from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupon data."""
    
    is_valid = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'coupon_type', 'value',
            'min_order_value', 'max_discount', 'applicable_categories',
            'first_order_only', 'usage_limit', 'usage_count',
            'is_active', 'valid_from', 'valid_until', 'is_valid',
            'days_until_expiry', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class CouponValidationSerializer(serializers.Serializer):
    """Serializer for validating coupon codes."""
    
    code = serializers.CharField()
    
    def validate_code(self, value):
        # Clean the code
        code = value.strip().upper()
        if not code:
            raise serializers.ValidationError("Coupon code is required")
        return code


class ValidateCouponResponseSerializer(serializers.Serializer):
    """Serializer for coupon validation response."""
    
    valid = serializers.BooleanField()
    message = serializers.CharField()
    coupon = CouponSerializer()
    potential_discount = serializers.DecimalField(max_digits=10, decimal_places=2)
