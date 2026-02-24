from django.db import models
from django.conf import settings


class ContactMessage(models.Model):
    """Model for contact form messages."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_messages'
    )
    name = models.CharField(max_length=255, blank=False)
    email = models.EmailField(blank=False)
    message = models.TextField(blank=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', blank=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=False)
    updated_at = models.DateTimeField(auto_now=True, blank=False)

    class Meta:
        db_table = 'contact_messages'
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user'], name='contact_messages_user_idx'),
            models.Index(fields=['status'], name='contact_messages_status_idx'),
            models.Index(fields=['created_at'], name='contact_messages_created_idx'),
        ]

    def __str__(self):
        return f"{self.name} - {self.email}"