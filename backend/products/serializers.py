from rest_framework import serializers

from .models import Brand, Category, Product, ProductVariant


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'description', 'logo_url']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'emoji', 'parent', 'display_order', 'is_visible']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'sku',
            'variant_name',
            'price',
            'stock_quantity',
            'low_stock_threshold',
            'weight',
            'unit_type',
            'unit_value',
            'is_default',
        ]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_deleted=False),
        source='category',
        write_only=True,
        required=False,
    )
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.filter(is_deleted=False),
        source='brand',
        write_only=True,
        required=False,
        allow_null=True,
    )
    variants = serializers.SerializerMethodField()
    default_variant = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    stock = serializers.IntegerField(read_only=True)
    effective_price = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    rating = serializers.DecimalField(source='average_rating', max_digits=3, decimal_places=2, read_only=True)
    reviews_count = serializers.IntegerField(source='review_count', read_only=True)
    emoji = serializers.CharField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'brand',
            'brand_id',
            'category',
            'category_id',
            'description',
            'search_keywords',
            'tags',
            'attributes',
            'price',
            'stock',
            'effective_price',
            'discount_amount',
            'rating',
            'reviews_count',
            'emoji',
            'discount_percent',
            'is_featured',
            'is_new_arrival',
            'is_active',
            'image_url',
            'default_variant',
            'variants',
        ]
        read_only_fields = ['id', 'reviews_count', 'rating']

    def get_variants(self, obj):
        variants = obj.variants.filter(is_deleted=False).order_by('-is_default', 'id')
        return ProductVariantSerializer(variants, many=True).data

    def get_default_variant(self, obj):
        variant = obj.default_variant
        if not variant:
            return None
        return ProductVariantSerializer(variant).data

    def get_effective_price(self, obj):
        return obj.effective_price

    def get_discount_amount(self, obj):
        return obj.discount_amount


class ProductListSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    stock = serializers.IntegerField(read_only=True)
    effective_price = serializers.SerializerMethodField()
    rating = serializers.DecimalField(source='average_rating', max_digits=3, decimal_places=2, read_only=True)
    reviews_count = serializers.IntegerField(source='review_count', read_only=True)
    emoji = serializers.CharField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'effective_price',
            'emoji',
            'brand_name',
            'category',
            'rating',
            'reviews_count',
            'stock',
            'discount_percent',
            'is_featured',
            'is_new_arrival',
        ]

    def get_effective_price(self, obj):
        return obj.effective_price
