from django.conf import settings
from django.db import models

from .auth_group import AuthGroup


class UsersGroup(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    group = models.ForeignKey(AuthGroup, on_delete=models.CASCADE, related_name='+')

    class Meta:
        db_table = 'users_groups'
        managed = False
        unique_together = [('user', 'group')]
