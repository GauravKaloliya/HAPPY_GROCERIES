from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models

from products.models import Product, ProductVariant
from .product_combo import ProductCombo


class ProductComboItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    combo = models.ForeignKey(ProductCombo, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='combo_items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, related_name='combo_items')
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    override_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'product_combo_items'
        managed = False
        ordering = ['display_order', 'id']
        unique_together = ['combo', 'variant']
        indexes = [
            models.Index(fields=['combo'], name='combo_items_combo_idx'),
            models.Index(fields=['variant'], name='combo_items_variant_idx'),
            models.Index(fields=['product'], name='combo_items_product_idx'),
        ]

    def __str__(self):
        return f"{self.combo.name} - {self.variant.sku} x {self.quantity}"

    def clean(self):
        if self.variant_id and self.product_id and self.variant.product_id != self.product_id:
            raise ValidationError('Selected variant does not belong to selected product')

        if self.combo_id and not self.is_deleted:
            siblings = ProductComboItem.objects.filter(combo_id=self.combo_id, is_deleted=False)
            if self.pk:
                siblings = siblings.exclude(pk=self.pk)
            if siblings.count() >= 3:
                raise ValidationError('A combo cannot have more than 3 active items')

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)
