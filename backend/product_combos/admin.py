from django.contrib import admin

from .models import ProductCombo, ProductComboItem


@admin.register(ProductCombo)
class ProductComboAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'stock_status', 'is_active', 'is_featured', 'display_order')
    list_filter = ('is_active', 'is_featured', 'stock_status')
    search_fields = ('name',)


@admin.register(ProductComboItem)
class ProductComboItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'combo', 'product', 'variant', 'quantity', 'display_order', 'is_deleted')
    list_filter = ('is_deleted',)
    search_fields = ('combo__name', 'product__name', 'variant__sku')
