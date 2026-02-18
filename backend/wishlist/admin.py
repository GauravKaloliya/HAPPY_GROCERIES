from django.contrib import admin
from .models import Wishlist


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product_count', 'updated_at']
    list_select_related = ['user']
    filter_horizontal = ['products']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'
