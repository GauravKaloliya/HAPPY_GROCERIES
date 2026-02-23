from django.contrib import admin
from .models import SiteSettings, SortOption


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'site_name', 'tax_rate', 'standard_delivery_charge', 
        'express_delivery_charge', 'free_delivery_threshold',
        'min_order_value', 'max_cod_order_value', 'updated_at'
    ]
    
    def has_add_permission(self, request):
        # Only allow one settings instance
        if self.model.objects.count() >= 1:
            return False
        return super().has_add_permission(request)


@admin.register(SortOption)
class SortOptionAdmin(admin.ModelAdmin):
    list_display = ['label', 'value', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    ordering = ['order']