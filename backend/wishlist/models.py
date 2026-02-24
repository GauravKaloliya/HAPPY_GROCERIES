from django.db import models

from products.models import Product
from users.models import User


class WishlistItem(models.Model):
    """Wishlist item model."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'wishlist_items'
        unique_together = ('user', 'product')
        indexes = [
            models.Index(fields=['user'], name='wishlist_items_user_idx'),
            models.Index(fields=['product'], name='wishlist_items_product_idx'),
            models.Index(fields=['user', 'is_deleted'], name='wishlist_items_user_is_del_idx'),
            models.Index(fields=['product', 'is_deleted'], name='wishlist_items_prod_is_del_idx'),
        ]

    def __str__(self):
        return f"{self.user.phone} - {self.product.name}"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()
