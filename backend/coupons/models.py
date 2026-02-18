from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Coupon(models.Model):
    """Coupon model for discounts."""
    
    COUPON_TYPES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('category', 'Category-based'),
    ]
    
    code = models.CharField(max_length=20, unique=True, db_index=True)
    description = models.TextField(blank=True)
    coupon_type = models.CharField(max_length=20, choices=COUPON_TYPES, default='percentage')
    value = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    min_order_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    max_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    applicable_categories = models.JSONField(default=list, blank=True)
    first_order_only = models.BooleanField(default=False)
    usage_limit = models.PositiveIntegerField(default=None, null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.get_coupon_type_display()} ({self.value})"
    
    def is_valid(self):
        """Check if coupon is currently valid."""
        from django.utils import timezone
        now = timezone.now()
        
        if not self.is_active:
            return False
        
        if self.valid_from and now < self.valid_from:
            return False
        
        if self.valid_until and now > self.valid_until:
            return False
        
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        
        return True


class CouponUsage(models.Model):
    """Track coupon usage per user."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coupon_usages'
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='usages'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='coupon_usages'
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'coupon_usages'
        unique_together = ['user', 'coupon']
    
    def __str__(self):
        return f"{self.user.phone} used {self.coupon.code}"