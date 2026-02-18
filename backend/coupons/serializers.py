from rest_framework import serializers
from .models import Coupon, UsedCoupon


class CouponSerializer(serializers.ModelSerializer):
    applicable_categories = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'type', 'value',
            'min_order_value', 'max_discount', 'applicable_categories',
            'first_order_only', 'expiry_date', 'active', 'is_expired'
        ]
    
    def get_applicable_categories(self, obj):
        return obj.get_applicable_categories()


class CouponValidationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    cart_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class CouponSuggestionSerializer(serializers.Serializer):
    code = serializers.CharField()
    description = serializers.CharField()
    type = serializers.CharField()
    value = serializers.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    max_discount = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    applicable_categories = serializers.ListField(child=serializers.CharField(), allow_null=True)
    eligibility = serializers.CharField()  # applicable, almost, not_applicable
    potential_discount = serializers.DecimalField(max_digits=10, decimal_places=2)
    relevance_score = serializers.IntegerField()
    days_until_expiry = serializers.IntegerField()
    is_applied = serializers.BooleanField()
    is_used = serializers.BooleanField()
    eligibility_reason = serializers.CharField()
    amount_needed = serializers.DecimalField(max_digits=10, decimal_places=2)
    percentage_to_go = serializers.FloatField()
