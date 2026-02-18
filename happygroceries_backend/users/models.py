from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with phone as the primary identifier."""
    
    phone = models.CharField(max_length=10, unique=True, db_index=True)
    email = models.EmailField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    first_order = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.phone} - {self.name}" if hasattr(self, 'name') else self.phone
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
