from django.conf import settings
from django.db import models


class Cart(models.Model):
    """Shopping cart with OneToOne relationship to User."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'carts'
        managed = False
        indexes = [
            models.Index(fields=['user'], name='carts_user_idx'),
            models.Index(fields=['user', 'is_deleted'], name='carts_user_is_deleted_idx'),
        ]

    def __str__(self):
        return f"Cart for {self.user.phone}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.filter(is_deleted=False))

    @property
    def subtotal(self):
        return sum(item.total for item in self.items.filter(is_deleted=False))

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
        self.items.update(is_deleted=True, deleted_at=models.functions.Now())

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
