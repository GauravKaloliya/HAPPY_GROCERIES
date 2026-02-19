from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'product_emoji', 'quantity', 'discount_percent', 'subtotal'
        ]


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for order data."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_type_display = serializers.CharField(source='get_delivery_type_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'status', 'status_display', 'delivery_type', 'delivery_type_display',
            'subtotal', 'tax', 'delivery_charge', 'coupon_discount', 'total',
            'delivery_name', 'delivery_phone', 'delivery_address', 'delivery_instructions',
            'estimated_delivery', 'delivered_at', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_id', 'subtotal', 'tax', 'delivery_charge', 'coupon_discount',
            'total', 'created_at', 'updated_at'
        ]


class OrderItemInputSerializer(serializers.Serializer):
    """Serializer for order item input."""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating new orders."""
    
    delivery_name = serializers.CharField(max_length=100)
    delivery_phone = serializers.CharField(max_length=10)
    delivery_address = serializers.CharField()
    delivery_instructions = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_type = serializers.ChoiceField(choices=Order.DELIVERY_TYPES, default='standard')
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemInputSerializer(many=True)
