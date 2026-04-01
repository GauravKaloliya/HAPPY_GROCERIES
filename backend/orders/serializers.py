from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""

    variant_name = serializers.SerializerMethodField()
    sku = serializers.SerializerMethodField()
    unit_type = serializers.SerializerMethodField()
    unit_value = serializers.SerializerMethodField()

    def _variant_payload(self, obj):
        """
        Always return a complete variant payload for order items.
        Falls back to deterministic defaults so frontend never needs
        to render "Variant details unavailable".
        """
        product = getattr(obj, 'product', None)
        variant = getattr(product, 'default_variant', None) if product else None
        product_id = getattr(obj, 'product_id', None)

        if variant:
            return {
                'variant_name': variant.variant_name or 'Default',
                'sku': variant.sku or (f"SKU-P{product_id}" if product_id else 'SKU-DEFAULT'),
                'unit_type': variant.unit_type or 'piece',
                'unit_value': str(variant.unit_value or '1.000'),
            }

        return {
            'variant_name': 'Default',
            'sku': f"SKU-P{product_id}" if product_id else 'SKU-DEFAULT',
            'unit_type': 'piece',
            'unit_value': '1.000',
        }

    def get_variant_name(self, obj):
        return self._variant_payload(obj)['variant_name']

    def get_sku(self, obj):
        return self._variant_payload(obj)['sku']

    def get_unit_type(self, obj):
        return self._variant_payload(obj)['unit_type']

    def get_unit_value(self, obj):
        return self._variant_payload(obj)['unit_value']
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'product_emoji', 'quantity', 'discount_percent', 'subtotal',
            'variant_name', 'sku', 'unit_type', 'unit_value'
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
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, attrs):
        if attrs.get('product_id') is None:
            raise serializers.ValidationError('product_id is required')
        return attrs


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating new orders."""
    
    delivery_name = serializers.CharField(max_length=100)
    delivery_phone = serializers.CharField(max_length=10)
    delivery_address = serializers.CharField()
    delivery_instructions = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_type = serializers.ChoiceField(choices=Order.DELIVERY_TYPES, default='standard')
    coupon_code = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)
    items = OrderItemInputSerializer(many=True, required=False, allow_empty=True, default=list)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    delivery_charge = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
