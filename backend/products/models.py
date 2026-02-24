from django.db import models


class Category(models.Model):
    """Product category model."""

    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(default='')
    emoji = models.CharField(max_length=10, default='')
    color = models.CharField(max_length=50, default='var(--primary-pink)')
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        indexes = [
            models.Index(fields=['name'], name='categories_name_idx'),
            models.Index(fields=['is_deleted'], name='categories_is_deleted_idx'),
        ]

    def __str__(self):
        return self.name

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class Brand(models.Model):
    """Product brand model."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'brands'
        indexes = [
            models.Index(fields=['name'], name='brands_name_idx'),
            models.Index(fields=['is_active'], name='brands_is_active_idx'),
            models.Index(fields=['is_deleted'], name='brands_is_deleted_idx'),
        ]

    def __str__(self):
        return self.name

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class Product(models.Model):
    """Product model with Indian GST compliance."""

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

    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='piece')
    pack_size = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)

    category = models.ForeignKey(Category, on_delete=models.RESTRICT, db_index=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, blank=True, null=True, db_index=True)
    brand_name = models.CharField(max_length=100, blank=True)

    hsn_code = models.CharField(max_length=8, blank=True, null=True)
    gst_rate = models.DecimalField(max_digits=4, decimal_places=2, choices=GST_RATE_CHOICES, default=5.00)

    is_veg = models.BooleanField(default=True)
    is_organic = models.BooleanField(default=False)
    is_fresh = models.BooleanField(default=False)

    emoji = models.CharField(max_length=10, default='')
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.0)
    reviews_count = models.IntegerField(default=0)
    stock = models.IntegerField(default=0)
    discount_percent = models.IntegerField(default=0)
    description = models.TextField(default='')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['name'], name='products_name_idx'),
            models.Index(fields=['category', 'is_active'], name='products_cat_is_active_idx'),
            models.Index(fields=['brand'], name='products_brand_id_idx'),
            models.Index(fields=['unit'], name='products_unit_idx'),
            models.Index(fields=['mrp'], name='products_mrp_idx'),
            models.Index(fields=['gst_rate'], name='products_gst_rate_idx'),
            models.Index(fields=['is_veg'], name='products_is_veg_idx'),
            models.Index(fields=['is_organic'], name='products_is_organic_idx'),
            models.Index(fields=['is_fresh'], name='products_is_fresh_idx'),
            models.Index(fields=['is_deleted'], name='products_is_deleted_idx'),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.mrp < self.price:
            raise ValidationError('MRP must be greater than or equal to price.')

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class Combo(models.Model):
    """Product combo/bundle model."""

    name = models.CharField(max_length=200)
    description = models.TextField(default='')
    discount_percent = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    products = models.ManyToManyField(Product, through='CombosProducts', related_name='combos')

    class Meta:
        db_table = 'combos'
        indexes = [
            models.Index(fields=['is_active'], name='combos_is_active_idx'),
            models.Index(fields=['is_deleted'], name='combos_is_deleted_idx'),
        ]

    def __str__(self):
        return self.name

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class CombosProducts(models.Model):
    """Many-to-many relationship between Combo and Product."""

    combo = models.ForeignKey(Combo, on_delete=models.CASCADE, db_index=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True)

    class Meta:
        db_table = 'combos_products'
        unique_together = ('combo', 'product')
        indexes = [
            models.Index(fields=['combo'], name='combos_products_combo_idx'),
            models.Index(fields=['product'], name='combos_products_product_idx'),
        ]

    def __str__(self):
        return f"{self.combo.name} - {self.product.name}"
