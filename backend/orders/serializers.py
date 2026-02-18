from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price_at_time', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'items', 'subtotal', 'tax', 'delivery_charge',
            'coupon_discount', 'total', 'coupon_code', 'delivery_name',
            'delivery_phone', 'delivery_address', 'delivery_type',
            'estimated_delivery', 'created_at', 'updated_at'
        ]


class OrderCreateSerializer(serializers.Serializer):
    delivery_name = serializers.CharField(max_length=100)
    delivery_phone = serializers.CharField(max_length=10)
    delivery_address = serializers.CharField()
    delivery_type = serializers.ChoiceField(choices=['standard', 'express'], default='standard')
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def validate_delivery_phone(self, value):
        phone = ''.join(filter(str.isdigit, value))
        if len(phone) != 10:
            raise serializers.ValidationError('Phone number must be 10 digits.')
        return phone


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order lists."""
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'total', 'item_count',
            'delivery_type', 'estimated_delivery', 'created_at'
        ]
    
    def get_item_count(self, obj):
        return obj.items.count()
