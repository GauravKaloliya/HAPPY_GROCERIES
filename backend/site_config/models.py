from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Q, CheckConstraint
from decimal import Decimal


class SiteSettings(models.Model):
    """Site-wide configuration settings."""

    # Tax settings
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=Decimal('0.0800'),
        validators=[MinValueValidator(0)],
        help_text='Tax rate as decimal (e.g., 0.08 for 8%)'
    )

    # Delivery charges
    standard_delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('40.00'),
        validators=[MinValueValidator(0)],
        help_text='Standard delivery charge'
    )
    express_delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('50.00'),
        validators=[MinValueValidator(0)],
        help_text='Express delivery charge'
    )

    # Free delivery threshold
    free_delivery_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('500.00'),
        validators=[MinValueValidator(0)],
        help_text='Order amount above which delivery is free'
    )

    # Site info
    site_name = models.CharField(max_length=100, default='HappyGroceries')
    site_currency = models.CharField(max_length=10, default='₹')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'
        constraints = [
            CheckConstraint(condition=Q(tax_rate__gte=0), name='site_settings_tax_rate_gte_0'),
            CheckConstraint(condition=Q(standard_delivery_charge__gte=0), name='site_settings_standard_delivery_gte_0'),
            CheckConstraint(condition=Q(express_delivery_charge__gte=0), name='site_settings_express_delivery_gte_0'),
            CheckConstraint(condition=Q(free_delivery_threshold__gte=0), name='site_settings_free_threshold_gte_0'),
        ]

    def __str__(self):
        return f'Site Settings (updated: {self.updated_at})'

    @classmethod
    def get_settings(cls):
        """Get or create site settings singleton."""
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings


class SortOption(models.Model):
    """Dynamic sort options for products."""

    value = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0, help_text='Display order')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sort_options'
        ordering = ['order', 'label']
        verbose_name = 'Sort Option'
        verbose_name_plural = 'Sort Options'
        indexes = [
            models.Index(fields=['order'], name='sort_options_order_idx'),
        ]
        constraints = [
            CheckConstraint(condition=Q(order__gte=0), name='sort_options_order_gte_0'),
        ]

    def __str__(self):
        return self.label
