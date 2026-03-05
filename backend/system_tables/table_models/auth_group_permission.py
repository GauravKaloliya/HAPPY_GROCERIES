from django.db import models

from .auth_group import AuthGroup
from .auth_permission import AuthPermission


class AuthGroupPermission(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, on_delete=models.CASCADE, related_name='+')
    permission = models.ForeignKey(AuthPermission, on_delete=models.CASCADE, related_name='+')

    class Meta:
        db_table = 'auth_group_permissions'
        managed = False
        unique_together = [('group', 'permission')]
