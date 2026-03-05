from decimal import Decimal

from django.db import models


class SiteSettings(models.Model):
    """Site-wide configuration settings."""

    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0800'), help_text='Tax rate as decimal (e.g., 0.08 for 8%)')
    standard_delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('40.00'), help_text='Standard delivery charge')
    express_delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('50.00'), help_text='Express delivery charge')
    free_delivery_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('500.00'), help_text='Order amount above which delivery is free')
    site_name = models.CharField(max_length=100, default='Happy Groceries')
    site_currency = models.CharField(max_length=10, default='₹')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'
        managed = False

    def __str__(self):
        return f'Site Settings (updated: {self.updated_at})'

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
