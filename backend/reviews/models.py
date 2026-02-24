from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.db.models import Q, CheckConstraint


class ProductReview(models.Model):
    """Product review and rating model."""

    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='reviews',
        help_text='The order that contained this product'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        choices=RATING_CHOICES,
        help_text='Rating from 1 to 5 stars'
    )
    title = models.CharField(max_length=100, default='')
    comment = models.TextField(max_length=1000, help_text='Review feedback')

    # Moderation fields
    is_approved = models.BooleanField(default=True)
    is_verified_purchase = models.BooleanField(default=True, help_text='Verified as purchased')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'product_reviews'
        ordering = ['-created_at']
        unique_together = ['user', 'product', 'order']
        indexes = [
            models.Index(fields=['user'], name='product_reviews_user_idx'),
            models.Index(fields=['product'], name='product_reviews_product_idx'),
            models.Index(fields=['order'], name='product_reviews_order_idx'),
            models.Index(fields=['product', 'is_approved', 'is_deleted'], name='pr_prod_approved_del_idx'),
            models.Index(fields=['user', 'is_deleted'], name='pr_user_is_deleted_idx'),
            models.Index(fields=['rating'], name='product_reviews_rating_idx'),
        ]
        constraints = [
            CheckConstraint(condition=Q(comment__regex=r'^[\s\S]{0,1000}$'), name='product_reviews_comment_length'),
            CheckConstraint(condition=Q(rating__gte=1, rating__lte=5), name='product_reviews_rating_range'),
        ]

    def __str__(self):
        return f'{self.user.phone} - {self.product.name} ({self.rating} stars)'

    def soft_delete(self):
        """Perform soft delete on the review."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted review."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])


class ReviewHelpful(models.Model):
    """Track helpful votes on reviews."""

    review = models.ForeignKey(
        ProductReview,
        on_delete=models.CASCADE,
        related_name='helpful_votes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='review_votes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_helpful_votes'
        unique_together = ['review', 'user']
        indexes = [
            models.Index(fields=['review'], name='rev_helpful_review_idx'),
            models.Index(fields=['user'], name='review_helpful_votes_user_idx'),
        ]

    def __str__(self):
        return f'{self.user.phone} found review #{self.review.id} helpful'
