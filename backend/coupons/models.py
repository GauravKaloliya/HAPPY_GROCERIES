from django.db import models

from users.models import User
from orders.models import Order


class Coupon(models.Model):
    """Coupon model with category-based and first-order support."""

    COUPON_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed'),
        ('category', 'Category'),
    ]

    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(default='')
    coupon_type = models.CharField(max_length=20, choices=COUPON_TYPE_CHOICES, default='percentage')
    value = models.DecimalField(max_digits=5, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    applicable_categories = models.JSONField(default=list)
    first_order_only = models.BooleanField(default=False)
    usage_limit = models.IntegerField(blank=True, null=True)
    usage_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(blank=True, null=True)
    valid_until = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'coupons'
        indexes = [
            models.Index(fields=['code'], name='coupons_code_idx'),
            models.Index(fields=['is_active'], name='coupons_is_active_idx'),
            models.Index(fields=['is_active', 'valid_until'], name='coupons_active_valid_idx'),
            models.Index(fields=['applicable_categories'], name='coupons_categories_gin'),
            models.Index(fields=['code', 'is_active'], name='coupons_code_is_active_idx'),
            models.Index(fields=['is_deleted'], name='coupons_is_deleted_idx'),
        ]

    def __str__(self):
        return self.code

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class CouponUsage(models.Model):
    """Coupon usage tracking model."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, db_index=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_index=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'coupon_usages'
        unique_together = ('user', 'coupon')
        indexes = [
            models.Index(fields=['user'], name='coupon_usages_user_idx'),
            models.Index(fields=['coupon'], name='coupon_usages_coupon_idx'),
            models.Index(fields=['order'], name='coupon_usages_order_idx'),
            models.Index(fields=['user', 'is_deleted'], name='coupon_usages_user_is_deleted_idx'),
            models.Index(fields=['coupon', 'is_deleted'], name='coupon_usages_coupon_is_deleted_idx'),
            models.Index(fields=['is_deleted'], name='coupon_usages_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.user.phone} - {self.coupon.code}"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()
