from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with phone as the primary identifier."""
    
    phone = models.CharField(max_length=10, unique=True, db_index=True)
    email = models.EmailField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    first_order = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.phone} - {self.name}" if hasattr(self, 'name') else self.phone
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def soft_delete(self):
        """Perform soft delete on the user."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
    
    def restore(self):
        """Restore a soft-deleted user."""
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])


class UserActivityLog(models.Model):
    """Model to track user activities."""
    
    ACTIVITY_TYPES = [
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('register', 'User Registration'),
        ('profile_update', 'Profile Update'),
        ('password_change', 'Password Change'),
        ('password_reset', 'Password Reset'),
        ('order_placed', 'Order Placed'),
        ('order_cancelled', 'Order Cancelled'),
        ('order_delivered', 'Order Delivered'),
        ('cart_add', 'Add to Cart'),
        ('cart_remove', 'Remove from Cart'),
        ('wishlist_add', 'Add to Wishlist'),
        ('wishlist_remove', 'Remove from Wishlist'),
        ('coupon_apply', 'Coupon Applied'),
        ('coupon_remove', 'Coupon Removed'),
        ('profile_view', 'Profile Viewed'),
        ('settings_update', 'Settings Updated'),
        ('search', 'Product Search'),
        ('product_view', 'Product Viewed'),
        ('category_view', 'Category Viewed'),
        ('checkout', 'Checkout Initiated'),
        ('payment', 'Payment Processed'),
        ('address_add', 'Address Added'),
        ('address_update', 'Address Updated'),
        ('address_delete', 'Address Deleted'),
        ('contact_submit', 'Contact Form Submitted'),
        ('email_verification', 'Email Verification'),
        ('phone_verification', 'Phone Verification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES, db_index=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    session_id = models.CharField(max_length=100, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'user_activity_logs'
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'
        ordering = ['-created_at']
    
    def __str__(self):
        user_info = self.user.name if self.user else 'Anonymous'
        return f"{user_info} - {self.get_activity_type_display()} - {self.created_at}"


class ContactForm(models.Model):
    """Model for contact form submissions."""
    
    CATEGORY_CHOICES = [
        ('general', 'General Inquiry'),
        ('order', 'Order Support'),
        ('delivery', 'Delivery Issues'),
        ('payment', 'Payment Problems'),
        ('product', 'Product Questions'),
        ('account', 'Account Issues'),
        ('business', 'Business Partnership'),
        ('feedback', 'Feedback'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    response_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contact_forms'
        verbose_name = 'Contact Form'
        verbose_name_plural = 'Contact Forms'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject} - {self.get_status_display()}"
