from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0007_product_new_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='combo',
            name='combo_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, validators=[django.core.validators.MinValueValidator(0)]),
        ),
        migrations.AddIndex(
            model_name='combo',
            index=models.Index(fields=['combo_price'], name='combos_price_idx'),
        ),
    ]