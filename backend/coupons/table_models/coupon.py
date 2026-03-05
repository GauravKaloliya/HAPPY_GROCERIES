from django.contrib.postgres.indexes import GinIndex
from django.core.validators import MinValueValidator
from django.db import models


class Coupon(models.Model):
    """Coupon model for discounts."""

    id = models.AutoField(primary_key=True)
    COUPON_TYPES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('category', 'Category-based'),
    ]

    code = models.CharField(max_length=20, unique=True, db_index=True)
    description = models.TextField(default='')
    coupon_type = models.CharField(max_length=20, choices=COUPON_TYPES, default='percentage')
    value = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    applicable_categories = models.JSONField(default=list)
    first_order_only = models.BooleanField(default=False)
    usage_limit = models.PositiveIntegerField(default=None, null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']
        managed = False
        indexes = [
            models.Index(fields=['is_active'], name='coupons_is_active_idx'),
            models.Index(fields=['is_active', 'valid_until'], name='coupons_active_valid_idx'),
            models.Index(fields=['code', 'is_active'], name='coupons_code_is_active_idx'),
            models.Index(fields=['is_deleted'], name='coupons_is_deleted_idx'),
            GinIndex(fields=['applicable_categories'], name='coupons_categories_gin'),
        ]

    def __str__(self):
        return f"{self.code} - {self.get_coupon_type_display()} ({self.value})"

    def is_valid(self):
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
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
