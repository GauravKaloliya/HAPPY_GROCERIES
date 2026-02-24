from rest_framework import serializers
from .models import Category, Brand, Product, Combo


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for category data."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'emoji', 'color']


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for brand data."""

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo', 'is_active']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for product data."""

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source='brand',
        write_only=True,
        required=False,
        allow_null=True
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
            'id', 'name', 'price', 'mrp', 'effective_price', 'discount_amount',
            'unit', 'pack_size', 'category', 'category_id', 'brand', 'brand_id',
            'brand_name', 'hsn_code', 'gst_rate', 'is_veg', 'is_organic', 'is_fresh',
            'emoji', 'rating', 'reviews_count', 'stock', 'discount_percent',
            'description', 'is_active'
        ]
        read_only_fields = ['id', 'reviews_count', 'brand_name']


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists."""

    effective_price = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    def get_effective_price(self, obj):
        """Calculate effective price with discount."""
        return obj.effective_price

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'mrp', 'effective_price', 'unit', 'pack_size',
            'emoji', 'category', 'category_name', 'brand_name', 'rating',
            'reviews_count', 'stock', 'discount_percent', 'is_veg', 'is_organic',
            'is_fresh', 'is_active'
        ]


class ComboProductSerializer(serializers.ModelSerializer):
    """Simplified product serializer for combo display."""

    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'mrp', 'price', 'emoji', 'category', 'rating']


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
            'original_price', 'discounted_price', 'savings', 'is_active'
        ]
