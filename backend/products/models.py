from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """Product category model."""
    
    name = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    emoji = models.CharField(max_length=10, blank=True)
    color = models.CharField(
        max_length=50, 
        blank=True,
        default='var(--primary-pink)',
        help_text='CSS color variable or hex color for category'
    )
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
        on_delete=models.CASCADE,
        related_name='products'
    )
    emoji = models.CharField(max_length=10, blank=True)
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
    description = models.TextField(blank=True)
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
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['name']),
            models.Index(fields=['is_deleted']),
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


class Combo(models.Model):
    """Product combo model - combines 2-3 similar products together."""
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    products = models.ManyToManyField(Product, related_name='combos')
    discount_percent = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(0), MaxValueValidator(50)]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'combos'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def original_price(self):
        """Calculate total original price of all products in combo."""
        return sum(product.price for product in self.products.filter(is_active=True, is_deleted=False))
    
    @property
    def discounted_price(self):
        """Calculate combo price after discount."""
        original = self.original_price
        return original * (Decimal('1') - Decimal(self.discount_percent) / Decimal('100'))
    
    @property
    def savings(self):
        """Calculate savings amount."""
        return self.original_price - self.discounted_price
    
    def soft_delete(self):
        """Perform soft delete on the combo."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
    
    def restore(self):
        """Restore a soft-deleted combo."""
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
    
    def clean(self):
        """Validate that combo has 2-3 products."""
        from django.core.exceptions import ValidationError
        product_count = self.products.count()
        if product_count > 0 and (product_count < 2 or product_count > 3):
            raise ValidationError('Combo must have between 2 and 3 products.')
