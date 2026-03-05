from django.db import models


class TokenBlacklistedToken(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    token = models.CharField(max_length=500, unique=True)

    class Meta:
        db_table = 'token_blacklist_blacklistedtoken'
        managed = False
