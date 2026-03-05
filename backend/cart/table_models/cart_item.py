from django.core.validators import MinValueValidator
from django.db import models

from products.models import Product
from .cart import Cart


class CartItem(models.Model):
    """Individual items in a shopping cart."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'product']
        managed = False
        indexes = [
            models.Index(fields=['cart'], name='cart_items_cart_idx'),
            models.Index(fields=['product'], name='cart_items_product_idx'),
            models.Index(fields=['cart', 'is_deleted'], name='cart_items_cart_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    @property
    def total(self):
        return self.product.effective_price * self.quantity

    @property
    def original_total(self):
        return self.product.price * self.quantity

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
