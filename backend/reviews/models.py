from django.db import models

from products.models import Product
from users.models import User
from orders.models import Order


class ProductReview(models.Model):
    """Product review model."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_index=True)
    rating = models.IntegerField()
    title = models.CharField(max_length=100, default='')
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    is_verified_purchase = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'product_reviews'
        unique_together = ('user', 'product', 'order')
        indexes = [
            models.Index(fields=['user'], name='product_reviews_user_idx'),
            models.Index(fields=['product'], name='product_reviews_product_idx'),
            models.Index(fields=['order'], name='product_reviews_order_idx'),
            models.Index(fields=['product', 'is_approved', 'is_deleted'], name='prod_reviews_prod_app_del_idx'),
            models.Index(fields=['user', 'is_deleted'], name='prod_reviews_user_is_del_idx'),
            models.Index(fields=['rating'], name='product_reviews_rating_idx'),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.rating} stars"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.rating < 1 or self.rating > 5:
            raise ValidationError('Rating must be between 1 and 5.')
        if len(self.comment) > 1000:
            raise ValidationError('Comment cannot exceed 1000 characters.')

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class ReviewHelpfulVote(models.Model):
    """Review helpful vote model."""

    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_helpful_votes'
        unique_together = ('review', 'user')
        indexes = [
            models.Index(fields=['review'], name='review_helpful_votes_rev_idx'),
            models.Index(fields=['user'], name='review_helpful_votes_user_idx'),
        ]

    def __str__(self):
        return f"{self.review} - {self.user.phone}"
