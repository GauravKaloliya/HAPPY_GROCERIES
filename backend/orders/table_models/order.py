from django.conf import settings
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models


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
        related_name='orders'
    )
    order_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        validators=[RegexValidator(regex=r'^HG[0-9]{8}$')]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES, default='standard')

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    delivery_name = models.CharField(max_length=100)
    delivery_phone = models.CharField(max_length=10)
    delivery_address = models.TextField()
    delivery_instructions = models.TextField(default='')

    estimated_delivery = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        managed = False
        indexes = [
            models.Index(fields=['user'], name='orders_user_idx'),
            models.Index(fields=['status'], name='orders_status_idx'),
            models.Index(fields=['user', 'status'], name='orders_user_status_idx'),
            models.Index(fields=['is_deleted'], name='orders_is_deleted_idx'),
            models.Index(fields=['user', '-created_at'], name='orders_user_created_idx'),
        ]

    def __str__(self):
        return f"Order {self.order_id} - {self.user.phone}"

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
