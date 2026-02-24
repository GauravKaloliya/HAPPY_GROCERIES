from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with phone-based authentication."""

    phone = models.CharField(max_length=10, unique=True)
    email = models.EmailField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    first_order = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['phone'], name='users_phone_idx'),
            models.Index(fields=['username'], name='users_username_idx'),
            models.Index(fields=['is_deleted'], name='users_is_deleted_idx'),
        ]

    def __str__(self):
        return f"{self.phone} - {self.username}"

    def soft_delete(self):
        """Soft delete the user."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft-deleted user."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()
