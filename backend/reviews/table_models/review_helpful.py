from django.conf import settings
from django.db import models

from .product_review import ProductReview


class ReviewHelpful(models.Model):
    """Track helpful votes on reviews."""

    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='review_votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_helpful_votes'
        unique_together = ['review', 'user']
        managed = False
        indexes = [
            models.Index(fields=['review'], name='rev_help_votes_rev_idx'),
            models.Index(fields=['user'], name='review_helpful_votes_user_idx'),
        ]

    def __str__(self):
        return f'{self.user.phone} found review #{self.review.id} helpful'
