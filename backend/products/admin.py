from django.contrib import admin
from .models import Category, Brand, Product, Combo, ComboProduct


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'color', 'is_deleted']
    list_filter = ['is_deleted']
    search_fields = ['name', 'description']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'is_deleted']
    list_filter = ['is_active', 'is_deleted']
    search_fields = ['name', 'description', 'slug']


class ComboProductInline(admin.TabularInline):
    model = ComboProduct
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'price', 'mrp', 'unit', 'pack_size', 'stock', 'is_active', 'is_deleted']
    list_filter = ['category', 'brand', 'unit', 'gst_rate', 'is_veg', 'is_organic', 'is_fresh', 'is_active', 'is_deleted']
    search_fields = ['name', 'description', 'hsn_code', 'brand__name']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']


@admin.register(Combo)
class ComboAdmin(admin.ModelAdmin):
    list_display = ['name', 'discount_percent', 'is_active', 'is_deleted']
    list_filter = ['is_active', 'is_deleted']
    search_fields = ['name', 'description']
    inlines = [ComboProductInline]
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
