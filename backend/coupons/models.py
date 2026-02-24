from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.contrib.postgres.indexes import GinIndex


class Coupon(models.Model):
    """Coupon model for discounts."""

    COUPON_TYPES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('category', 'Category-based'),
    ]

    code = models.CharField(max_length=20, unique=True, blank=False)
    description = models.TextField(default='', blank=False)
    coupon_type = models.CharField(max_length=20, choices=COUPON_TYPES, default='percentage', blank=False)
    value = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=False,
        validators=[MinValueValidator(0)]
    )
    min_order_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        blank=False,
        validators=[MinValueValidator(0)]
    )
    max_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    applicable_categories = models.JSONField(default=list, blank=False)
    first_order_only = models.BooleanField(default=False, blank=False)
    usage_limit = models.PositiveIntegerField(default=None, null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0, blank=False)
    is_active = models.BooleanField(default=True, blank=False)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=False)

    # Soft delete fields
    is_deleted = models.BooleanField(default=False, blank=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code'], name='coupons_code_idx'),
            models.Index(fields=['is_active'], name='coupons_is_active_idx'),
            models.Index(fields=['is_active', 'valid_until'], name='coupons_active_valid_idx'),
            GinIndex(fields=['applicable_categories'], name='coupons_categories_gin'),
            models.Index(fields=['code', 'is_active'], name='coupons_code_is_active_idx'),
            models.Index(fields=['is_deleted'], name='coupons_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.code} - {self.get_coupon_type_display()} ({self.value})"

    def is_valid(self):
        """Check if coupon is currently valid."""
        from django.utils import timezone
        now = timezone.now()

        if not self.is_active or self.is_deleted:
            return False

        if self.valid_from and now < self.valid_from:
            return False

        if self.valid_until and now > self.valid_until:
            return False

        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False

        return True

    def soft_delete(self):
        """Perform soft delete on the coupon."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active'])

    def restore(self):
        """Restore a soft-deleted coupon."""
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active'])


class CouponUsage(models.Model):
    """Track coupon usage per user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coupon_usages',
        blank=False
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='usages',
        blank=False
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='coupon_usages',
        blank=False
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])
    used_at = models.DateTimeField(auto_now_add=True, blank=False)

    # Soft delete fields
    is_deleted = models.BooleanField(default=False, blank=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'coupon_usages'
        unique_together = ['user', 'coupon']
        indexes = [
            models.Index(fields=['user'], name='coupon_usages_user_idx'),
            models.Index(fields=['coupon'], name='coupon_usages_coupon_idx'),
            models.Index(fields=['order'], name='coupon_usages_order_idx'),
            models.Index(fields=['user', 'is_deleted'], name='cu_user_is_deleted_idx'),
            models.Index(fields=['coupon', 'is_deleted'], name='cu_coupon_is_deleted_idx'),
            models.Index(fields=['is_deleted'], name='coupon_usages_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.user.phone} used {self.coupon.code}"

    def soft_delete(self):
        """Perform soft delete on the coupon usage."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted coupon usage."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
