from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'coupon_type', 'value', 'min_order_value', 'usage_count', 'is_active',
                    'valid_from', 'valid_until', 'is_deleted']
    list_filter = ['coupon_type', 'is_active', 'first_order_only', 'is_deleted', 'valid_from', 'valid_until']
    search_fields = ['code', 'description']
    readonly_fields = ['created_at', 'deleted_at']


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'coupon', 'order', 'discount_amount', 'used_at', 'is_deleted']
    list_filter = ['used_at', 'is_deleted']
    search_fields = ['user__phone', 'coupon__code', 'order__order_id']
    readonly_fields = ['created_at', 'deleted_at']
