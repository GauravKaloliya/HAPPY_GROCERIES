from rest_framework import serializers
from .models import WishlistItem
from products.serializers import ProductSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items."""
    
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class WishlistItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wishlist items."""
    
    class Meta:
        model = WishlistItem
        fields = ['product']
