from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['phone', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_superuser',
                    'first_order', 'failed_login_attempts', 'is_deleted']
    list_filter = ['is_active', 'is_superuser', 'first_order', 'is_deleted']
    search_fields = ['phone', 'username', 'email', 'first_name', 'last_name']
    readonly_fields = ['last_login', 'date_joined', 'created_at', 'updated_at', 'deleted_at', 'locked_until']

    fieldsets = (
        (None, {'fields': ('phone', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'address', 'avatar')}),
        ('Authentication', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Security', {'fields': ('failed_login_attempts', 'locked_until')}),
        ('Order info', {'fields': ('first_order',)}),
        ('Timestamps', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at', 'deleted_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'username', 'email', 'password1', 'password2'),
        }),
    )
