from django.db import models


class SiteSettings(models.Model):
    """Site-wide settings model."""

    tax_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.0800)
    standard_delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=40.00)
    express_delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    free_delivery_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    site_name = models.CharField(max_length=100, default='HappyGroceries')
    site_currency = models.CharField(max_length=10, default='₹')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'site_settings'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and SiteSettings.objects.exists():
            raise ValueError('Only one SiteSettings instance is allowed.')
        return super().save(*args, **kwargs)


class SortOption(models.Model):
    """Sort options for product listings."""

    value = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sort_options'
        indexes = [
            models.Index(fields=['order'], name='sort_options_order_idx'),
        ]

    def __str__(self):
        return self.label
