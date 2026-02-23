from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_seed_combo_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='sku',
            field=models.CharField(blank=True, db_index=True, max_length=50, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='product',
            name='brand',
            field=models.CharField(blank=True, db_index=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='weight',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True, validators=[django.core.validators.MinValueValidator(0.01)]),
        ),
        migrations.AddField(
            model_name='product',
            name='weight_unit',
            field=models.CharField(blank=True, default='kg', max_length=10),
        ),
        migrations.AddField(
            model_name='product',
            name='quantity_per_unit',
            field=models.CharField(blank=True, default='per kg', max_length=50),
        ),
        migrations.AddField(
            model_name='product',
            name='is_organic',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='is_vegetarian',
            field=models.BooleanField(default=True),
        ),
    ]