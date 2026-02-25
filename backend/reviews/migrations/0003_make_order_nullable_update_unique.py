import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
        ('reviews', '0002_rename_product_reviews_product_approved_idx_prod_rev_prod_app_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productreview',
            name='order',
            field=models.ForeignKey(
                blank=True,
                help_text='The order that contained this product',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reviews',
                to='orders.order',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='productreview',
            unique_together={('user', 'product')},
        ),
    ]
