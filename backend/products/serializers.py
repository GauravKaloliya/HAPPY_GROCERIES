from rest_framework import serializers
from .models import Category, Product, Combo


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
    display_weight = serializers.ReadOnlyField()
    display_quantity = serializers.ReadOnlyField()

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
            'stock', 'discount_percent', 'description', 'sku', 'brand',
            'weight', 'weight_unit', 'quantity_per_unit', 'display_weight',
            'display_quantity', 'is_organic', 'is_vegetarian', 'is_active'
        ]
        read_only_fields = ['id', 'reviews_count']


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists."""

    effective_price = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    display_quantity = serializers.ReadOnlyField()

    def get_effective_price(self, obj):
        """Calculate effective price with discount."""
        return obj.effective_price

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'effective_price', 'emoji',
            'category', 'rating', 'reviews_count', 'stock',
            'discount_percent', 'sku', 'brand', 'is_organic',
            'is_vegetarian', 'display_quantity'
        ]


class ComboProductSerializer(serializers.ModelSerializer):
    """Simplified product serializer for combo display."""

    category = CategorySerializer(read_only=True)
    display_quantity = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'emoji', 'category', 'rating', 
                  'sku', 'brand', 'is_organic', 'display_quantity']


class ComboSerializer(serializers.ModelSerializer):
    """Serializer for combo data."""

    products = ComboProductSerializer(many=True, read_only=True)
    original_price = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    savings = serializers.SerializerMethodField()

    def get_original_price(self, obj):
        """Calculate original price."""
        return obj.original_price

    def get_discounted_price(self, obj):
        """Calculate discounted price."""
        return obj.discounted_price

    def get_savings(self, obj):
        """Calculate savings."""
        return obj.savings

    class Meta:
        model = Combo
        fields = [
            'id', 'name', 'description', 'products', 'discount_percent',
            'combo_price', 'original_price', 'discounted_price', 'savings', 
            'is_active'
        ]
