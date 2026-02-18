from django.contrib import admin
from .models import User, UserActivityLog, ContactForm


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'email', 'first_name', 'last_name', 'is_verified', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_verified', 'is_deleted', 'created_at')
    search_fields = ('phone', 'email', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'updated_at', 'date_joined', 'last_login')
    filter_horizontal = ('user_permissions', 'groups')
    
    fieldsets = (
        ('Personal info', {
            'fields': ('username', 'phone', 'email', 'first_name', 'last_name', 'avatar')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Status', {
            'fields': ('is_verified', 'first_order', 'failed_login_attempts', 'locked_until')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
        ('Soft delete', {
            'fields': ('is_deleted', 'deleted_at')
        }),
    )


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'ip_address', 'created_at')
    list_filter = ('activity_type', 'created_at', 'user')
    search_fields = ('user__username', 'user__phone', 'user__email', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User', {
            'fields': ('user', 'session_id')
        }),
        ('Activity', {
            'fields': ('activity_type', 'description', 'metadata')
        }),
        ('Technical Info', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ContactForm)
class ContactFormAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'category', 'subject', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('name', 'email', 'phone', 'subject', 'message')
    readonly_fields = ('created_at', 'updated_at', 'ip_address', 'user_agent')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contact Info', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('category', 'subject', 'message')
        }),
        ('Status', {
            'fields': ('status', 'admin_response', 'response_at')
        }),
        ('Technical Info', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_resolved', 'mark_as_in_progress']
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='resolved')
    mark_as_resolved.short_description = 'Mark as Resolved'
    
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
    mark_as_in_progress.short_description = 'Mark as In Progress'
