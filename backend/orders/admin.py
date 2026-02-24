from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_price', 'discount_percent', 'applied_discount_amount', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'user', 'status', 'delivery_type', 'subtotal', 'applied_discount_amount',
                    'tax', 'coupon_discount', 'delivery_charge', 'total', 'created_at']
    list_filter = ['status', 'delivery_type', 'created_at']
    search_fields = ['order_id', 'user__phone', 'delivery_name', 'delivery_phone']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product_name', 'quantity', 'product_price', 'discount_percent',
                    'applied_discount_amount', 'subtotal']
    list_filter = ['order__status']
    search_fields = ['product_name', 'order__order_id']
    readonly_fields = ['deleted_at']
