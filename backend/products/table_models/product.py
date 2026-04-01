from decimal import Decimal
import re

from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from .category import Category


def _normalize_emoji_text(*parts):
    combined = ' '.join(
        ' '.join(part) if isinstance(part, (list, tuple, set)) else str(part)
        for part in parts
        if part
    ).lower()
    combined = re.sub(r'[^a-z0-9]+', ' ', combined)
    combined = re.sub(r'\s+', ' ', combined).strip()
    return f' {combined} ' if combined else ''


def infer_product_emoji(name='', description='', tags=None):
    value = _normalize_emoji_text(name, description, tags)
    compact_value = value.replace(' ', '')

    emoji_keywords = [
        (('dragon fruit', 'dragonfruit', 'dragon'), '🐉'),
        (('pineapple',), '🍍'),
        (('strawberry', 'strawberries', 'berries'), '🍓'),
        (('watermelon',), '🍉'),
        (('banana', 'bananas'), '🍌'),
        (('orange', 'oranges', 'mandarin', 'tangerine'), '🍊'),
        (('kiwi', 'kivi'), '🥝'),
        (('grape', 'grapes'), '🍇'),
        (('mango',), '🥭'),
        (('lemon',), '🍋'),
        (('apple', 'apples', 'pomegranate'), '🍎'),
        (('pear',), '🍐'),
        (('peach',), '🍑'),
        (('cherry',), '🍒'),
        (('melon',), '🍈'),
        (('coconut',), '🥥'),
        (('avocado',), '🥑'),
        (('tomato',), '🍅'),
        (('carrot',), '🥕'),
        (('corn', 'maize'), '🌽'),
        (('pepper', 'capsicum', 'chili', 'chilli'), '🫑'),
        (('leaf', 'lettuce', 'cabbage', 'spinach'), '🥬'),
        (('broccoli',), '🥦'),
        (('cucumber',), '🥒'),
        (('potato',), '🥔'),
        (('sweet potato',), '🍠'),
        (('onion',), '🧅'),
        (('garlic',), '🧄'),
        (('ginger',), '🫚'),
        (('mushroom',), '🍄'),
        (('eggplant', 'brinjal', 'bringal', 'bringle', 'aubergine'), '🍆'),
        (('beans', 'bean', 'peas', 'pea', 'lentil', 'dal', 'pulse'), '🫘'),
        (('bread', 'bun', 'toast'), '🍞'),
        (('croissant',), '🥐'),
        (('bagel',), '🥯'),
        (('cheese', 'paneer', 'butter'), '🧀'),
        (('milk',), '🥛'),
        (('yogurt', 'yoghurt', 'curd'), '🥣'),
        (('egg',), '🥚'),
        (('rice',), '🍚'),
        (('salad',), '🥗'),
        (('juice',), '🧃'),
        (('coffee',), '☕'),
        (('tea',), '🍵'),
        (('smoothie', 'shake', 'milkshake'), '🥤'),
        (('soda', 'cola', 'soft drink'), '🥤'),
        (('honey',), '🍯'),
        (('chocolate', 'cocoa'), '🍫'),
        (('cookie', 'biscuit'), '🍪'),
        (('cake',), '🍰'),
        (('ice cream',), '🍨'),
        (('chips', 'crisps'), '🥔'),
        (('pizza',), '🍕'),
        (('burger',), '🍔'),
        (('sandwich',), '🥪'),
        (('noodle', 'noodles', 'pasta', 'spaghetti'), '🍝'),
        (('fish',), '🐟'),
        (('chicken',), '🍗'),
        (('meat', 'mutton', 'beef'), '🥩'),
        (('shrimp', 'prawn'), '🍤'),
        (('egg',), '🥚'),
    ]

    for keywords, emoji in emoji_keywords:
        matched = False
        for keyword in keywords:
            normalized_keyword = _normalize_emoji_text(keyword)
            compact_keyword = normalized_keyword.replace(' ', '')
            bare_keyword = normalized_keyword.strip()

            if not bare_keyword:
                continue

            if normalized_keyword in value or compact_keyword in compact_value:
                matched = True
                break

            # Allow common admin typos/prefix variants like "bringle"/"brinjal".
            if len(bare_keyword) >= 5 and bare_keyword[:5] in compact_value:
                matched = True
                break

        if matched:
            return emoji

    return '🛒'


def infer_product_category_name(name=''):
    value = (name or '').strip().lower()
    if not value:
        return None

    category_keywords = {
        'Fruits': (
            'dragon fruit',
            'dragonfruit',
            'apple',
            'banana',
            'orange',
            'grape',
            'grapes',
            'strawberry',
            'watermelon',
            'mango',
            'pineapple',
            'kiwi',
            'papaya',
            'guava',
            'pomegranate',
            'blueberry',
            'peach',
            'cherry',
            'avocado',
            'pear',
            'lemon',
            'lime',
            'coconut',
            'melon',
        ),
        'Vegetables': (
            'carrot',
            'tomato',
            'broccoli',
            'cucumber',
            'potato',
            'corn',
            'spinach',
            'cauliflower',
            'cabbage',
            'onion',
            'garlic',
            'bell pepper',
            'capsicum',
            'sweet potato',
            'peas',
            'beans',
            'mushroom',
            'eggplant',
            'brinjal',
            'bringal',
            'bringle',
            'lettuce',
        ),
    }

    for category_name, keywords in category_keywords.items():
        if any(keyword in value for keyword in keywords):
            return category_name

    return None


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, db_index=True)
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
        attribute_emoji = (self.attributes or {}).get('emoji', '')
        if attribute_emoji and attribute_emoji != '🛒':
            return attribute_emoji

        inferred = infer_product_emoji(self.name, self.description, self.tags)
        if inferred != '🛒':
            return inferred
        if self.emoji_db and self.emoji_db != '🛒':
            return self.emoji_db
        if self.category and self.category.emoji:
            return self.category.emoji
        if self.emoji_db:
            return self.emoji_db
        if attribute_emoji:
            return attribute_emoji
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
