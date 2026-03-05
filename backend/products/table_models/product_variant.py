from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from .product import Product


class ProductVariant(models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=80, unique=True)
    variant_name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    low_stock_threshold = models.IntegerField(default=10, validators=[MinValueValidator(1)])
    weight = models.IntegerField(null=True, blank=True)
    unit_type = models.CharField(max_length=30, default='piece')
    unit_value = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal('1.000'))
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'product_variants'
        managed = False

    def __str__(self):
        return f"{self.product.name} - {self.variant_name}"
