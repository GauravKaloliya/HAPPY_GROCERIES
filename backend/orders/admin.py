from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price_at_time']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'user', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_id', 'user__name', 'user__phone']
    readonly_fields = ['order_id', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    def order_id(self, obj):
        return obj.id
    order_id.short_description = 'Order ID'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price_at_time']
    list_select_related = ['order', 'product']
