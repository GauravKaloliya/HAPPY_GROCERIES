from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_config', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='min_order_value',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('100.00'),
                max_digits=10,
                help_text='Minimum order value required'
            ),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='max_cod_order_value',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                default=Decimal('2000.00'),
                max_digits=10,
                null=True,
                help_text='Maximum order value for Cash on Delivery'
            ),
        ),
    ]