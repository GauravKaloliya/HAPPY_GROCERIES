from django.db import models


class SortOption(models.Model):
    """Dynamic sort options for products."""

    id = models.AutoField(primary_key=True)
    value = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0, help_text='Display order')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sort_options'
        ordering = ['order', 'label']
        verbose_name = 'Sort Option'
        verbose_name_plural = 'Sort Options'
        managed = False
        indexes = [models.Index(fields=['order', 'label'], name='sort_options_order_idx')]

    def __str__(self):
        return self.label
