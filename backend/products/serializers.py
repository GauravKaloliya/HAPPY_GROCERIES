from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'emoji', 'color']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'category_id', 'emoji',
            'rating', 'reviews_count', 'stock', 'discount_percent',
            'description', 'is_active', 'discounted_price', 'has_discount',
            'in_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_discount_percent(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('Discount percent must be between 0 and 100.')
        return value


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists."""
    category = CategorySerializer(read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'emoji', 'rating',
            'reviews_count', 'stock', 'discount_percent', 'description',
            'discounted_price', 'has_discount', 'in_stock'
        ]
