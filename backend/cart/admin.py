from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    """Inline for cart items in cart."""
    model = CartItem
    extra = 0
    readonly_fields = ['added_at', 'price_at_add_time']
    fields = ['product', 'quantity', 'price_at_add_time', 'is_deleted']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin interface for Cart model."""
    
    list_display = ['id', 'user', 'total_items', 'created_at', 'updated_at']
    search_fields = ['user__phone', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Total Items'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin interface for CartItem model."""
    
    list_display = ['id', 'cart', 'product', 'quantity', 'price_at_add_time', 'added_at', 'is_deleted']
    list_filter = ['is_deleted']
    search_fields = ['cart__user__phone', 'product__name']
    readonly_fields = ['added_at']