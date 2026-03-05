from decimal import Decimal

from rest_framework import serializers

from .models import ProductCombo, ProductComboItem


class ProductComboItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_emoji = serializers.CharField(source='product.emoji', read_only=True)
    variant_name = serializers.CharField(source='variant.variant_name', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)
    unit_type = serializers.CharField(source='variant.unit_type', read_only=True)
    unit_value = serializers.DecimalField(source='variant.unit_value', max_digits=10, decimal_places=3, read_only=True)
    variant_price = serializers.DecimalField(source='variant.price', max_digits=12, decimal_places=2, read_only=True)
    effective_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductComboItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_emoji',
            'variant',
            'variant_name',
            'sku',
            'unit_type',
            'unit_value',
            'variant_price',
            'override_price',
            'effective_price',
            'quantity',
            'display_order',
        ]

    def get_effective_price(self, obj):
        return obj.override_price if obj.override_price is not None else obj.variant.price


class ProductComboListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = ProductCombo
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'price',
            'stock_status',
            'is_featured',
            'display_order',
            'items_count',
        ]

    def get_items_count(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('items')
        if prefetched is not None:
            return len([item for item in prefetched if not item.is_deleted])
        return obj.items.filter(is_deleted=False).count()


class ProductComboSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    total_mrp = serializers.SerializerMethodField()
    savings = serializers.SerializerMethodField()

    class Meta:
        model = ProductCombo
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'price',
            'stock_status',
            'is_featured',
            'display_order',
            'items_count',
            'total_mrp',
            'savings',
            'items',
            'created_at',
            'updated_at',
        ]

    def _active_items(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('items')
        if prefetched is not None:
            return [item for item in prefetched if not item.is_deleted]
        return list(
            obj.items.filter(is_deleted=False).select_related('product', 'variant').order_by('display_order', 'id')
        )

    def get_items(self, obj):
        return ProductComboItemSerializer(self._active_items(obj), many=True).data

    def get_items_count(self, obj):
        return len(self._active_items(obj))

    def get_total_mrp(self, obj):
        total = Decimal('0')
        for item in self._active_items(obj):
            unit_price = item.override_price if item.override_price is not None else item.variant.price
            total += unit_price * item.quantity
        return total

    def get_savings(self, obj):
        total_mrp = self.get_total_mrp(obj)
        return max(total_mrp - obj.price, Decimal('0'))
