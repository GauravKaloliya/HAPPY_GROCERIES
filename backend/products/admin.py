from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'color', 'product_count']
    search_fields = ['name']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'discount_percent', 'rating', 'is_active']
    list_filter = ['category', 'is_active', 'discount_percent']
    search_fields = ['name', 'description']
    list_editable = ['price', 'stock', 'is_active']
