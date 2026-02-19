from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for category data."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'emoji', 'color']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for product data."""

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    effective_price = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()

    def get_effective_price(self, obj):
        """Calculate effective price with discount."""
        return obj.effective_price

    def get_discount_amount(self, obj):
        """Calculate discount amount."""
        return obj.discount_amount

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

    effective_price = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)

    def get_effective_price(self, obj):
        """Calculate effective price with discount."""
        return obj.effective_price

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'effective_price', 'emoji',
            'category', 'rating', 'reviews_count', 'stock',
            'discount_percent'
        ]