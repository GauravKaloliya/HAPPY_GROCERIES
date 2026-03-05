from django.conf import settings
from django.db import models

from .auth_permission import AuthPermission


class UsersUserPermission(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    permission = models.ForeignKey(AuthPermission, on_delete=models.CASCADE, related_name='+')

    class Meta:
        db_table = 'users_user_permissions'
        managed = False
        unique_together = [('user', 'permission')]
