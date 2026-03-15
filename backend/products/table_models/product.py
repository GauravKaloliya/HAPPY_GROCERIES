from decimal import Decimal

from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from .brand import Brand
from .category import Category


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, db_index=True)
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.RESTRICT,
        related_name='products',
    )
    description = models.TextField(default='')
    search_keywords = ArrayField(models.TextField(), null=True, blank=True, default=list)
    tags = ArrayField(models.TextField(), null=True, blank=True, default=list)
    attributes = models.JSONField(default=dict, blank=True)
    price_db = models.DecimalField(max_digits=12, decimal_places=2, default=0, db_column='price')
    stock_db = models.IntegerField(default=0, db_column='stock')
    rating_db = models.DecimalField(max_digits=3, decimal_places=2, default=0, db_column='rating')
    reviews_count_db = models.IntegerField(default=0, db_column='reviews_count')
    emoji_db = models.CharField(max_length=10, default='', db_column='emoji')
    discount_percent_db = models.IntegerField(default=0, db_column='discount_percent')
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    review_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    image_url = models.CharField(max_length=512, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'products'
        ordering = ['id']
        managed = False

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def _resolve_default_variant(self):
        prefetched = getattr(self, '_prefetched_objects_cache', {}).get('variants')
        if prefetched is not None:
            active = [v for v in prefetched if not v.is_deleted]
            if not active:
                return None
            active.sort(key=lambda item: (not item.is_default, item.id))
            return active[0]
        return self.variants.filter(is_deleted=False).order_by('-is_default', 'id').first()

    @property
    def default_variant(self):
        return self._resolve_default_variant()

    @property
    def price(self):
        variant = self.default_variant
        if not variant:
            return self.price_db or Decimal('0')
        return variant.price

    @property
    def stock(self):
        variant = self.default_variant
        if not variant:
            return int(self.stock_db or 0)
        return variant.stock_quantity

    @property
    def rating(self):
        if self.average_rating:
            return self.average_rating
        return self.rating_db

    @property
    def reviews_count(self):
        if self.review_count:
            return self.review_count
        return self.reviews_count_db

    @property
    def discount_percent(self):
        if self.attributes:
            raw = self.attributes.get('discount_percent', 0)
        else:
            raw = self.discount_percent_db
        try:
            value = int(raw)
        except (TypeError, ValueError):
            value = 0
        return min(max(value, 0), 100)

    @property
    def emoji(self):
        if self.attributes and self.attributes.get('emoji'):
            return self.attributes.get('emoji')
        if self.emoji_db:
            return self.emoji_db
        return '🛒'

    @property
    def effective_price(self):
        price = self.price or Decimal('0')
        if self.discount_percent > 0:
            return price * (Decimal('1') - (Decimal(self.discount_percent) / Decimal('100')))
        return price

    @property
    def discount_amount(self):
        return (self.price or Decimal('0')) - self.effective_price

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
