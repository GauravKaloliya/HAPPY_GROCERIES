from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal', 'added_at']


class CartItemCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()
    
    class Meta:
        model = CartItem
        fields = ['product_id', 'quantity']
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        if value > 99:
            raise serializers.ValidationError('Quantity cannot exceed 99.')
        return value


class CartItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['quantity']
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        if value > 99:
            raise serializers.ValidationError('Quantity cannot exceed 99.')
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'created_at', 'updated_at']
