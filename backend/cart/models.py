from django.db import models

from products.models import Product
from users.models import User


class Cart(models.Model):
    """Shopping cart model."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'carts'
        indexes = [
            models.Index(fields=['user'], name='carts_user_idx'),
            models.Index(fields=['user', 'is_deleted'], name='carts_user_is_deleted_idx'),
        ]

    def __str__(self):
        return f"Cart - {self.user.phone}"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()

    @property
    def total_items(self):
        """Get total number of items in cart."""
        return self.items.filter(is_deleted=False).count()

    @property
    def total_amount(self):
        """Get total amount of items in cart."""
        total = sum(
            item.product.price * item.quantity
            for item in self.items.filter(is_deleted=False)
        )
        return total

    @property
    def subtotal(self):
        """Get subtotal of items in cart (with discounts applied)."""
        total = sum(
            item.product.effective_price * item.quantity
            for item in self.items.filter(is_deleted=False)
        )
        return total


class CartItem(models.Model):
    """Cart item model."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', db_index=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = ('cart', 'product')
        indexes = [
            models.Index(fields=['cart'], name='cart_items_cart_idx'),
            models.Index(fields=['product'], name='cart_items_product_idx'),
            models.Index(fields=['cart', 'is_deleted'], name='cart_items_cart_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()

    @property
    def subtotal(self):
        """Get subtotal for this cart item."""
        return self.product.price * self.quantity

    @property
    def total(self):
        """Get total price for this cart item (with discount applied)."""
        return self.product.effective_price * self.quantity

    @property
    def original_total(self):
        """Get original total price for this cart item (without discount)."""
        return self.product.price * self.quantity
