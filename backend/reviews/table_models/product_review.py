from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class ProductReview(models.Model):
    """Product review and rating model."""

    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=False,
        blank=False,
        help_text='The order that contained this product',
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        choices=RATING_CHOICES,
        help_text='Rating from 1 to 5 stars',
    )
    title = models.CharField(max_length=100, default='')
    comment = models.TextField(max_length=1000, help_text='Review feedback')

    is_approved = models.BooleanField(default=True)
    is_verified_purchase = models.BooleanField(default=True, help_text='Verified as purchased')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'product_reviews'
        ordering = ['-created_at']
        unique_together = ['user', 'product', 'order']
        managed = False
        indexes = [
            models.Index(fields=['user'], name='product_reviews_user_idx'),
            models.Index(fields=['product'], name='product_reviews_product_idx'),
            models.Index(fields=['product', 'is_approved', 'is_deleted'], name='prod_rev_prod_app_idx'),
            models.Index(fields=['user', 'is_deleted'], name='prod_rev_user_del_idx'),
            models.Index(fields=['rating'], name='product_reviews_rating_idx'),
        ]

    def __str__(self):
        return f'{self.user.phone} - {self.product.name} ({self.rating} stars)'

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
