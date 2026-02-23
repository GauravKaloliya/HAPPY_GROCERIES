from decimal import Decimal
from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('cart', '0003_soft_delete_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='cartitem',
            name='price_at_add_time',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('0.00'),
                max_digits=10,
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        ),
        migrations.AddIndex(
            model_name='cartitem',
            index=models.Index(fields=['price_at_add_time'], name='cart_item_price_idx'),
        ),
    ]