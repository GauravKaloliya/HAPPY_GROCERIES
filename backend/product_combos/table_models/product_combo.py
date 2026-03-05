from django.core.validators import MinValueValidator
from django.db import models


class ProductCombo(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=150)
    description = models.TextField(default='')
    image_url = models.CharField(max_length=512, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    stock_status = models.CharField(max_length=20, default='available')
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'product_combos'
        ordering = ['display_order', 'name']
        managed = False
        indexes = [
            models.Index(fields=['is_active', 'is_featured', 'display_order'], name='combos_active_featured_idx'),
            models.Index(fields=['price'], name='combos_price_idx'),
        ]

    def __str__(self):
        return self.name
