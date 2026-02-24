from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, RegexValidator


class Order(models.Model):
    """Order model for storing customer orders."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    DELIVERY_TYPES = [
        ('standard', 'Standard'),
        ('express', 'Express'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
        blank=False
    )
    order_id = models.CharField(
        max_length=20,
        unique=True,
        blank=False,
        validators=[RegexValidator(regex=r'^HG[0-9]{8}$')]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', blank=False)
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES, default='standard', blank=False)

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])
    tax = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])
    applied_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        blank=False,
        validators=[MinValueValidator(0)]
    )
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=False, validators=[MinValueValidator(0)])
    total = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])

    # Delivery details
    delivery_name = models.CharField(max_length=100, blank=False)
    delivery_phone = models.CharField(max_length=15, blank=False)
    delivery_address = models.TextField(blank=False)
    delivery_instructions = models.TextField(default='', blank=False)

    # Timestamps
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=False)
    updated_at = models.DateTimeField(auto_now=True, blank=False)

    # Soft delete fields
    is_deleted = models.BooleanField(default=False, blank=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_id'], name='orders_order_id_idx'),
            models.Index(fields=['user'], name='orders_user_idx'),
            models.Index(fields=['status'], name='orders_status_idx'),
            models.Index(fields=['user', 'status'], name='orders_user_status_idx'),
            models.Index(fields=['is_deleted'], name='orders_is_deleted_idx'),
            models.Index(fields=['user', 'created_at'], name='orders_user_created_idx'),
            models.Index(fields=['applied_discount_amount'], name='orders_applied_discount_idx'),
        ]

    def __str__(self):
        return f"Order {self.order_id} - {self.user.phone}"

    def soft_delete(self):
        """Perform soft delete on the order."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted order."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])


class OrderItem(models.Model):
    """Individual items in an order."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        blank=False
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
        null=True,
        blank=True
    )
    product_name = models.CharField(max_length=100, blank=False)
    product_price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])
    product_emoji = models.CharField(max_length=10, default='', blank=False)
    quantity = models.PositiveIntegerField(blank=False)
    discount_percent = models.PositiveIntegerField(default=0, blank=False)
    applied_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        blank=False,
        validators=[MinValueValidator(0)]
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False, validators=[MinValueValidator(0)])

    # Soft delete fields
    is_deleted = models.BooleanField(default=False, blank=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'order_items'
        indexes = [
            models.Index(fields=['order'], name='order_items_order_idx'),
            models.Index(fields=['product'], name='order_items_product_idx'),
            models.Index(fields=['order', 'is_deleted'], name='order_items_ord_is_del_idx'),
            models.Index(fields=['is_deleted'], name='order_items_is_deleted_idx'),
            models.Index(fields=['applied_discount_amount'], name='order_items_appl_disc_idx'),
        ]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def soft_delete(self):
        """Perform soft delete on the order item."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted order item."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
