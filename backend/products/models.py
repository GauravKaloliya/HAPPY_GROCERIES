from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """Product category model."""

    name = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(default='')
    emoji = models.CharField(max_length=10, default='')
    color = models.CharField(
        max_length=50,
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
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_deleted']),
        ]

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


class Brand(models.Model):
    """Brand model for products."""

    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    logo = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'brands'
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return self.name

    def soft_delete(self):
        """Perform soft delete on the brand."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted brand."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])


class Product(models.Model):
    """Product model for the grocery store."""

    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('mg', 'Milligram'),
        ('ltr', 'Liter'),
        ('ml', 'Milliliter'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
        ('dozen', 'Dozen'),
        ('bunch', 'Bunch'),
        ('bottle', 'Bottle'),
        ('can', 'Can'),
        ('box', 'Box'),
        ('jar', 'Jar'),
        ('other', 'Other'),
    ]

    GST_RATE_CHOICES = [
        (0.00, '0%'),
        (0.25, '0.25%'),
        (5.00, '5%'),
        (12.00, '12%'),
        (18.00, '18%'),
        (28.00, '28%'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, db_index=True)

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Selling price / discounted price'
    )
    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Maximum Retail Price (mandatory in India)'
    )

    # Unit & Packaging
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='piece',
        db_index=True
    )
    pack_size = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.01)],
        help_text='Pack size (e.g., 0.5 for 500g, 1 for 1kg, 6 for pack of 6)'
    )

    # Category & Brand
    category = models.ForeignKey(
        Category,
        on_delete=models.RESTRICT,
        related_name='products'
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        related_name='products',
        null=True,
        blank=True,
        db_index=True
    )
    brand_name = models.CharField(
        max_length=100,
        blank=True,
        help_text='Denormalized copy for faster reads'
    )

    # Tax & Compliance (India-specific)
    hsn_code = models.CharField(max_length=8, blank=True, null=True)
    gst_rate = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        choices=GST_RATE_CHOICES,
        default=5.00,
        db_index=True,
        validators=[
            MinValueValidator(0.00),
            MaxValueValidator(28.00)
        ]
    )

    # Flags / Badges
    is_veg = models.BooleanField(default=True, db_index=True)
    is_organic = models.BooleanField(default=False, db_index=True)
    is_fresh = models.BooleanField(default=False, db_index=True)

    # Display & Quality
    emoji = models.CharField(max_length=10, default='')
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    reviews_count = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    discount_percent = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    description = models.TextField(default='')

    # Status
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
            models.Index(fields=['brand']),
            models.Index(fields=['unit']),
            models.Index(fields=['mrp']),
            models.Index(fields=['gst_rate']),
            models.Index(fields=['is_veg']),
            models.Index(fields=['is_organic']),
            models.Index(fields=['is_fresh']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    @property
    def effective_price(self):
        """Calculate price after discount."""
        return self.price

    @property
    def discount_amount(self):
        """Calculate discount amount."""
        return self.mrp - self.price

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

    def save(self, *args, **kwargs):
        # Auto-populate brand_name from brand if not set
        if self.brand and not self.brand_name:
            self.brand_name = self.brand.name
        super().save(*args, **kwargs)


class ComboProduct(models.Model):
    """Through model for combos and products relationship."""

    combo = models.ForeignKey(
        'Combo',
        on_delete=models.CASCADE,
        related_name='combo_products'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='combo_products'
    )

    class Meta:
        db_table = 'combos_products'
        unique_together = ['combo', 'product']
        indexes = [
            models.Index(fields=['combo']),
            models.Index(fields=['product']),
        ]

    def __str__(self):
        return f"{self.combo.name} - {self.product.name}"


class Combo(models.Model):
    """Product combo model - combines 2-3 similar products together."""

    name = models.CharField(max_length=200)
    description = models.TextField(default='')
    products = models.ManyToManyField(
        Product,
        through=ComboProduct,
        related_name='combos'
    )
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
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return self.name

    @property
    def original_price(self):
        """Calculate total original price of all products in combo."""
        return sum(product.mrp for product in self.products.filter(is_active=True, is_deleted=False))

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
