from rest_framework import serializers
from products.serializers import ProductListSerializer, ProductVariantSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items."""
    
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    original_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'variant', 'quantity', 'added_at', 'total', 'original_total'
        ]
        read_only_fields = ['id', 'added_at']


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
        items = obj.items.filter(is_deleted=False).select_related('product', 'product__category', 'variant')
        return CartItemSerializer(items, many=True).data


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding items to cart."""

    product_id = serializers.IntegerField(required=True)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, max_value=99, default=1)

    def validate(self, attrs):
        from products.models import Product
        product_id = attrs.get('product_id')
        variant_id = attrs.get('variant_id')
        if not Product.objects.filter(id=product_id, is_active=True, is_deleted=False).exists():
            raise serializers.ValidationError("Product not found or not available")
        if product_id and variant_id:
            from products.models import ProductVariant
            if not ProductVariant.objects.filter(id=variant_id, product_id=product_id, is_deleted=False).exists():
                raise serializers.ValidationError("Variant does not belong to product")
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""

    quantity = serializers.IntegerField(min_value=0, max_value=99)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
