from django.conf import settings
from django.db import models


class TokenOutstandingToken(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    token = models.CharField(max_length=500, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='+')
    jti = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'token_blacklist_outstandingtoken'
        managed = False
