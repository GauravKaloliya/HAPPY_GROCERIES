import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with phone as the primary identifier."""
    
    phone = models.CharField(max_length=10, unique=True, db_index=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    first_order = models.BooleanField(default=True)
    last_order_date = models.DateTimeField(null=True, blank=True)
    referral_code = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['username']),
            models.Index(fields=['referral_code']),
            models.Index(fields=['last_order_date']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.phone} - {self.name}" if hasattr(self, 'name') else self.phone
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self.generate_referral_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_referral_code():
        """Generate a unique referral code."""
        while True:
            code = f"REF{uuid.uuid4().hex[:8].upper()}"
            if not User.objects.filter(referral_code=code).exists():
                return code
    
    def soft_delete(self):
        """Perform soft delete on the user."""
        self.is_deleted = True
        self.deleted_at = models.functions.Now()
        self.is_active = False
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
    
    def restore(self):
        """Restore a soft-deleted user."""
        self.is_deleted = False
        self.deleted_at = None
        self.is_active = True
        self.save(update_fields=['is_deleted', 'deleted_at', 'is_active', 'updated_at'])
