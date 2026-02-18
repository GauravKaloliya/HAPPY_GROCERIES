from django.db import models
from django.conf import settings
from django.utils import timezone


class Coupon(models.Model):
    COUPON_TYPES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('category', 'Category Specific'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=COUPON_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    applicable_categories = models.TextField(blank=True, help_text='Comma-separated category names')
    first_order_only = models.BooleanField(default=False)
    
    expiry_date = models.DateField()
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'coupons'
        verbose_name = 'Coupon'
        verbose_name_plural = 'Coupons'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.code
    
    @property
    def is_expired(self):
        return timezone.now().date() > self.expiry_date
    
    def get_applicable_categories(self):
        """Parse applicable categories from comma-separated string."""
        if not self.applicable_categories:
            return []
        return [cat.strip() for cat in self.applicable_categories.split(',') if cat.strip()]
    
    def is_valid_for_user(self, user, cart_total, cart_items):
        """Check if coupon is valid for the given user and cart."""
        if not self.active or self.is_expired:
            return False
        
        # Check if already used
        if UsedCoupon.objects.filter(user=user, coupon=self).exists():
            return False
        
        # Check minimum order value
        if cart_total < self.min_order_value:
            return False
        
        # Check first order only
        if self.first_order_only:
            from orders.models import Order
            if Order.objects.filter(user=user).exists():
                return False
        
        # Check category applicability
        if self.type == 'category':
            categories = self.get_applicable_categories()
            if categories:
                has_matching = any(
                    item.product.category.name in categories
                    for item in cart_items
                )
                if not has_matching:
                    return False
        
        return True
    
    def calculate_discount(self, cart_total, cart_items):
        """Calculate discount amount for the given cart."""
        if self.type == 'fixed':
            discount = self.value
        elif self.type == 'percentage':
            discount = (cart_total * self.value) / 100
        elif self.type == 'category':
            # Calculate discount only on applicable categories
            categories = self.get_applicable_categories()
            category_total = sum(
                item.product.discounted_price * item.quantity
                for item in cart_items
                if item.product.category.name in categories
            )
            discount = (category_total * self.value) / 100
        else:
            discount = 0
        
        # Apply max discount cap
        if self.max_discount and discount > self.max_discount:
            discount = self.max_discount
        
        # Ensure discount doesn't exceed cart total
        return min(discount, cart_total)


class UsedCoupon(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='used_coupons'
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='uses'
    )
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'used_coupons'
        verbose_name = 'Used Coupon'
        verbose_name_plural = 'Used Coupons'
        unique_together = ['user', 'coupon']
    
    def __str__(self):
        return f"{self.user.name} - {self.coupon.code}"
