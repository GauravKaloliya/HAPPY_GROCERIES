from django.db import models

from users.models import User


class ActivityLog(models.Model):
    """User activity log model."""

    ACTION_CHOICES = [
        ('page_view', 'Page View'),
        ('product_view', 'Product View'),
        ('add_to_cart', 'Add to Cart'),
        ('remove_from_cart', 'Remove from Cart'),
        ('search', 'Search'),
        ('filter_apply', 'Filter Apply'),
        ('add_to_wishlist', 'Add to Wishlist'),
        ('remove_from_wishlist', 'Remove from Wishlist'),
        ('coupon_apply', 'Coupon Apply'),
        ('checkout', 'Checkout'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('signup', 'Signup'),
        ('contact_form', 'Contact Form'),
        ('profile_update', 'Profile Update'),
        ('settings_change', 'Settings Change'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, db_index=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    page = models.CharField(max_length=255)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        indexes = [
            models.Index(fields=['user', 'created_at'], name='activity_logs_user_created_idx'),
            models.Index(fields=['action', 'created_at'], name='act_logs_action_created_idx'),
            models.Index(fields=['page'], name='activity_logs_page_idx'),
            models.Index(fields=['session_id'], name='activity_logs_session_id_idx'),
            models.Index(fields=['user'], name='activity_logs_user_idx'),
        ]

    def __str__(self):
        return f"{self.action} - {self.page}"
