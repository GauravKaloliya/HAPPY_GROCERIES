from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager for phone-based authentication."""
    
    def create_user(self, phone, username, password=None, **extra_fields):
        if not phone:
            raise ValueError('The Phone field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        
        user = self.model(
            phone=phone,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone, username, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(phone, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with phone as the primary identifier."""
    
    username = models.CharField(max_length=150, unique=True, blank=False)
    password = models.CharField(max_length=128, blank=False)
    last_login = models.DateTimeField(blank=True, null=True)
    first_name = models.CharField(max_length=150, default='')
    last_name = models.CharField(max_length=150, default='')
    phone = models.CharField(max_length=10, unique=True, db_index=True, blank=False)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Status fields
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    
    # Login tracking
    failed_login_attempts = models.IntegerField(default=0, blank=False)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Order tracking
    first_order = models.BooleanField(default=True, blank=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, blank=False)
    updated_at = models.DateTimeField(auto_now=True, blank=False)
    
    # Soft delete fields
    is_deleted = models.BooleanField(default=False, blank=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username', 'email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['phone'], name='users_phone_idx'),
            models.Index(fields=['username'], name='users_username_idx'),
            models.Index(fields=['is_deleted'], name='users_is_deleted_idx'),
        ]
    
    def __str__(self):
        return f"{self.phone} - {self.name}"
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def is_staff(self):
        return self.is_superuser
    
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
