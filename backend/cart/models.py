from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from products.models import Product


class Cart(models.Model):
    """Shopping cart with OneToOne relationship to User."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'carts'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['user', 'is_deleted']),
        ]
    
    def __str__(self):
        return f"Cart for {self.user.phone}"
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.filter(is_deleted=False))
    
    @property
    def subtotal(self):
        return sum(item.total for item in self.items.filter(is_deleted=False))
    
    def soft_delete(self):
        """Perform soft delete on the cart."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
        # Also soft delete all cart items
        self.items.update(is_deleted=True, deleted_at=models.functions.Now())
    
    def restore(self):
        """Restore a soft-deleted cart."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])


class CartItem(models.Model):
    """Individual items in a shopping cart."""
    
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    price_at_add_time = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0)]
    )
    added_at = models.DateTimeField(auto_now_add=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'product']
        indexes = [
            models.Index(fields=['cart']),
            models.Index(fields=['product']),
            models.Index(fields=['price_at_add_time']),
            models.Index(fields=['cart', 'is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    @property
    def total(self):
        """Calculate total using price_at_add_time if available, otherwise effective_price."""
        price = self.price_at_add_time if self.price_at_add_time else self.product.effective_price
        return Decimal(str(price)) * self.quantity
    
    @property
    def original_total(self):
        return self.product.price * self.quantity
    
    def soft_delete(self):
        """Perform soft delete on the cart item."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def restore(self):
        """Restore a soft-deleted cart item."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
