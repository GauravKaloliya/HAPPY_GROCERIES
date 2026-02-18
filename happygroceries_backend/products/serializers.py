from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for category data."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'emoji']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for product data."""
    
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    effective_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    discount_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'effective_price', 'discount_amount',
            'category', 'category_id', 'emoji', 'rating', 'reviews_count',
            'stock', 'discount_percent', 'description', 'is_active'
        ]
        read_only_fields = ['id', 'reviews_count']


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists."""
    
    effective_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'effective_price', 'emoji',
            'category', 'rating', 'reviews_count', 'stock',
            'discount_percent'
        ]