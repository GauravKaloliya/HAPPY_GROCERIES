from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin interface for ActivityLog model."""

    list_display = [
        'id', 'user', 'action', 'page', 'ip_address',
        'session_id', 'created_at'
    ]
    list_filter = ['action', 'created_at']
    search_fields = ['user__phone', 'user__email', 'page', 'session_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    def has_add_permission(self, request):
        """Disable manual addition through admin."""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable editing through admin."""
        return False
