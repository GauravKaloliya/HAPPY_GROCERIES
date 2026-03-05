from django.core.validators import MinValueValidator
from django.db import models

from products.models import Product
from .order import Order


class OrderItem(models.Model):
    """Individual items in an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items', null=True, blank=True)
    product_name = models.CharField(max_length=100)
    product_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    product_emoji = models.CharField(max_length=10, blank=True, default='')
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    discount_percent = models.PositiveIntegerField(default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'order_items'
        managed = False
        indexes = [
            models.Index(fields=['order'], name='order_items_order_idx'),
            models.Index(fields=['product'], name='order_items_product_idx'),
            models.Index(fields=['order', 'is_deleted'], name='ord_items_order_del_idx'),
            models.Index(fields=['is_deleted'], name='order_items_is_del_idx'),
        ]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
