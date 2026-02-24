from django.db import models
from django.conf import settings
from products.models import Product


class WishlistItem(models.Model):
    """Model for storing user's wishlist items."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'wishlist_items'
        unique_together = ['user', 'product']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user'], name='wi_user_idx'),
            models.Index(fields=['product'], name='wi_product_idx'),
            models.Index(fields=['user', 'is_deleted'], name='wi_user_is_deleted_idx'),
            models.Index(fields=['product', 'is_deleted'], name='wi_product_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.user.phone} - {self.product.name}"

    def soft_delete(self):
        """Perform soft delete on the wishlist item."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted wishlist item."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
