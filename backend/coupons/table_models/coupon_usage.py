from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from .coupon import Coupon


class CouponUsage(models.Model):
    """Track coupon usage per user."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usages')
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='coupon_usages')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    used_at = models.DateTimeField(auto_now_add=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'coupon_usages'
        unique_together = ['user', 'coupon']
        managed = False
        indexes = [
            models.Index(fields=['user'], name='coupon_usages_user_idx'),
            models.Index(fields=['coupon'], name='coupon_usages_coupon_idx'),
            models.Index(fields=['order'], name='coupon_usages_order_idx'),
            models.Index(fields=['user', 'is_deleted'], name='coupon_usages_user_del_idx'),
            models.Index(fields=['coupon', 'is_deleted'], name='coupon_usages_coup_del_idx'),
            models.Index(fields=['is_deleted'], name='coupon_usages_is_del_idx'),
        ]

    def __str__(self):
        return f"{self.user.phone} used {self.coupon.code}"

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
