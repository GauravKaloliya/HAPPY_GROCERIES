from django.contrib import admin
from .models import Coupon, UsedCoupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'type', 'value', 'min_order_value', 'active', 'expiry_date']
    list_filter = ['type', 'active', 'expiry_date']
    search_fields = ['code', 'description']
    list_editable = ['active']
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['applicable_categories'].help_text = 'Comma-separated category names'
        return form


@admin.register(UsedCoupon)
class UsedCouponAdmin(admin.ModelAdmin):
    list_display = ['user', 'coupon', 'used_at']
    list_filter = ['used_at']
    search_fields = ['user__name', 'coupon__code']
