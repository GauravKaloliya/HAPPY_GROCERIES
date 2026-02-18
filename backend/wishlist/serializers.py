from rest_framework import serializers
from .models import Wishlist
from products.serializers import ProductListSerializer


class WishlistSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'products', 'product_count', 'created_at', 'updated_at']


class WishlistAddSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)


class WishlistRemoveSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
