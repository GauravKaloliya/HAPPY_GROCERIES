from rest_framework import serializers
from products.serializers import ProductListSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items."""
    
    product = ProductListSerializer(read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    original_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    price_at_add_time = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'quantity', 'price_at_add_time', 'added_at', 
            'total', 'original_total'
        ]
        read_only_fields = ['id', 'added_at', 'price_at_add_time']


class CartSerializer(serializers.ModelSerializer):
    """Serializer for cart data."""

    items = serializers.SerializerMethodField()
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_items', 'subtotal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_items(self, obj):
        items = obj.items.filter(is_deleted=False).select_related('product', 'product__category')
        return CartItemSerializer(items, many=True).data


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding items to cart."""
    
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=99, default=1)
    
    def validate_product_id(self, value):
        from products.models import Product
        if not Product.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Product not found or not available")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""
    
    quantity = serializers.IntegerField(min_value=0, max_value=99)
