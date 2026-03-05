from django.conf import settings
from django.db import models

from .django_content_type import DjangoContentType


class DjangoAdminLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    action_time = models.DateTimeField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    content_type = models.ForeignKey(DjangoContentType, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    object_id = models.TextField(null=True, blank=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()

    class Meta:
        db_table = 'django_admin_log'
        managed = False
