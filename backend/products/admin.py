from django.contrib import admin
from .models import Category, Product, Combo


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    
    list_display = ['id', 'name', 'emoji', 'color', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['is_deleted']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for Product model."""
    
    list_display = [
        'id', 'name', 'sku', 'brand', 'price', 'category', 'stock',
        'discount_percent', 'is_organic', 'is_vegetarian', 'is_active'
    ]
    list_filter = ['category', 'is_active', 'is_organic', 'is_vegetarian', 'is_deleted']
    search_fields = ['name', 'sku', 'brand', 'description']
    list_editable = ['price', 'stock', 'discount_percent', 'is_active']
    ordering = ['id']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'sku', 'category', 'brand')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_percent')
        }),
        ('Stock & Status', {
            'fields': ('stock', 'is_active')
        }),
        ('Display', {
            'fields': ('emoji', 'description', 'rating', 'reviews_count')
        }),
        ('Product Details', {
            'fields': ('weight', 'weight_unit', 'quantity_per_unit', 'is_organic', 'is_vegetarian')
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at')
        }),
    )


class ComboProductInline(admin.TabularInline):
    """Inline for products in combo."""
    model = Combo.products.through
    extra = 1


@admin.register(Combo)
class ComboAdmin(admin.ModelAdmin):
    """Admin interface for Combo model."""
    
    list_display = ['id', 'name', 'discount_percent', 'combo_price', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_deleted']
    search_fields = ['name', 'description']
    inlines = [ComboProductInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description')
        }),
        ('Pricing', {
            'fields': ('discount_percent', 'combo_price')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at')
        }),
    )