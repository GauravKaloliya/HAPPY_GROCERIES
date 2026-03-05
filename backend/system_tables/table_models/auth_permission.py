from django.db import models

from .django_content_type import DjangoContentType


class AuthPermission(models.Model):
    id = models.AutoField(primary_key=True)
    content_type = models.ForeignKey(DjangoContentType, on_delete=models.CASCADE, related_name='+')
    codename = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'auth_permission'
        managed = False
        unique_together = [('content_type', 'codename')]
