from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin interface for User model."""
    
    list_display = [
        'id', 'phone', 'username', 'email', 'first_name', 'last_name',
        'is_verified', 'is_active', 'first_order', 'referral_code',
        'last_order_date', 'created_at'
    ]
    list_filter = ['is_verified', 'is_active', 'is_staff', 'first_order', 'is_deleted']
    search_fields = ['phone', 'username', 'email', 'first_name', 'last_name', 'referral_code']
    readonly_fields = ['created_at', 'updated_at', 'referral_code']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('phone', 'username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'address', 'avatar')
        }),
        ('Verification & Status', {
            'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser', 'first_order', 'last_order_date')
        }),
        ('Security', {
            'fields': ('failed_login_attempts', 'locked_until')
        }),
        ('Referral', {
            'fields': ('referral_code',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'date_joined', 'last_login')
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at')
        }),
    )