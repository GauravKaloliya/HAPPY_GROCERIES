from django.db import models
from decimal import Decimal


class SiteSettings(models.Model):
    """Site-wide configuration settings."""
    
    # Tax settings
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=Decimal('0.0800'),
        help_text='Tax rate as decimal (e.g., 0.08 for 8%)'
    )
    
    # Delivery charges
    standard_delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('40.00'),
        help_text='Standard delivery charge'
    )
    express_delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('50.00'),
        help_text='Express delivery charge'
    )
    
    # Free delivery threshold
    free_delivery_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('500.00'),
        help_text='Order amount above which delivery is free'
    )
    
    # Order value limits
    min_order_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('100.00'),
        help_text='Minimum order value required'
    )
    max_cod_order_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('2000.00'),
        null=True,
        blank=True,
        help_text='Maximum order value for Cash on Delivery'
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
    
    def __str__(self):
        return self.label
