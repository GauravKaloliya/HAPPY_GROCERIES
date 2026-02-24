from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_items', 'subtotal', 'created_at', 'updated_at']
    list_filter = ['is_deleted', 'created_at']
    search_fields = ['user__phone', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'total', 'original_total', 'added_at']
    list_filter = ['added_at', 'is_deleted']
    search_fields = ['cart__user__phone', 'product__name']
    readonly_fields = ['added_at', 'deleted_at']
