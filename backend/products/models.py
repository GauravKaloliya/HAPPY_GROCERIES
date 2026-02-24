from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """Product category model."""
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(default='')
    emoji = models.CharField(max_length=10, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
    
    def soft_delete(self):
        """Perform soft delete on the category."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def restore(self):
        """Restore a soft-deleted category."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])


class Product(models.Model):
    """Product model for the grocery store."""
    
    id = models.AutoField(primary_key=True)  # This will match the legacy IDs
    name = models.CharField(max_length=100, db_index=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.RESTRICT,
        related_name='products'
    )
    emoji = models.CharField(max_length=10, blank=True, default='')
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=4.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    reviews_count = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    discount_percent = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['id']
        indexes = [
            models.Index(fields=['category', 'is_active'], name='products_category_is_active_idx'),
            models.Index(fields=['name'], name='products_name_idx'),
            models.Index(fields=['is_deleted'], name='products_is_deleted_idx'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"
    
    @property
    def effective_price(self):
        """Calculate price after discount."""
        if self.discount_percent > 0:
            discount_multiplier = Decimal('1') - (Decimal(self.discount_percent) / Decimal('100'))
            return self.price * discount_multiplier
        return self.price
    
    @property
    def discount_amount(self):
        """Calculate discount amount."""
        return self.price * (Decimal(self.discount_percent) / Decimal('100'))
    
    def soft_delete(self):
        """Perform soft delete on the product."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
    
    def restore(self):
        """Restore a soft-deleted product."""
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])