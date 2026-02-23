from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_order_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='referral_code',
            field=models.CharField(blank=True, db_index=True, max_length=20, null=True, unique=True),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['last_order_date'], name='users_last_order_idx'),
        ),
    ]