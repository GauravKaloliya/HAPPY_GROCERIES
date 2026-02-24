from django.db import models

from users.models import User


class ContactMessage(models.Model):
    """Contact form message model."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contact_messages'
        indexes = [
            models.Index(fields=['user'], name='contact_messages_user_idx'),
            models.Index(fields=['status'], name='contact_messages_status_idx'),
            models.Index(fields=['created_at'], name='contact_messages_created_idx'),
        ]

    def __str__(self):
        return f"{self.name} - {self.status}"
