from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['added_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'item_count', 'total_amount', 'updated_at']
    list_select_related = ['user']
    inlines = [CartItemInline]
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'
    
    def total_amount(self, obj):
        return obj.total
    total_amount.short_description = 'Total'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'added_at']
    list_select_related = ['cart', 'product']
