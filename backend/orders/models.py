from django.db import models

from products.models import Product
from users.models import User


class Order(models.Model):
    """Order model with GST compliance."""

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

    DELIVERY_TYPE_CHOICES = DELIVERY_TYPES

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    order_id = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPE_CHOICES, default='standard')

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    applied_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2)
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    delivery_name = models.CharField(max_length=100)
    delivery_phone = models.CharField(max_length=15)
    delivery_address = models.TextField()
    delivery_instructions = models.TextField(default='')

    estimated_delivery = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'orders'
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
        return f"Order {self.order_id}"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class OrderItem(models.Model):
    """Order item model with snapshot pricing."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', db_index=True)
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, blank=True, null=True, db_index=True)
    product_name = models.CharField(max_length=100)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_emoji = models.CharField(max_length=10, default='')
    quantity = models.IntegerField()
    discount_percent = models.IntegerField(default=0)
    applied_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'order_items'
        indexes = [
            models.Index(fields=['order'], name='order_items_order_idx'),
            models.Index(fields=['product'], name='order_items_product_idx'),
            models.Index(fields=['order', 'is_deleted'], name='order_items_order_is_del_idx'),
            models.Index(fields=['is_deleted'], name='order_items_is_deleted_idx'),
            models.Index(fields=['applied_discount_amount'], name='order_items_applied_disc_idx'),
        ]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()
