from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    """Model to track user activities on the frontend."""

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
        ('contact_form', 'Contact Form Submit'),
        ('profile_update', 'Profile Update'),
        ('settings_change', 'Settings Change'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES, db_index=True)
    page = models.CharField(max_length=30, db_index=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=30, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'activity_logs'
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at'], name='act_logs_user_created_idx'),
            models.Index(fields=['action', 'created_at'], name='act_logs_action_created_idx'),
        ]

    def __str__(self):
        user_display = self.user.phone if self.user else 'Anonymous'
        return f"{user_display} - {self.action} on {self.page}"
