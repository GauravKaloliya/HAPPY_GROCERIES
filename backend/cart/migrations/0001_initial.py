import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('products', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='Cart',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                        ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='cart', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'carts',
                    },
                ),
                migrations.CreateModel(
                    name='CartItem',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('quantity', models.PositiveIntegerField(default=1)),
                        ('added_at', models.DateTimeField(auto_now_add=True)),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                        ('cart', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='cart.cart')),
                        ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cart_items', to='products.product')),
                    ],
                    options={
                        'db_table': 'cart_items',
                    },
                ),
                migrations.AddIndex(
                    model_name='cart',
                    index=models.Index(fields=['user'], name='carts_user_idx'),
                ),
                migrations.AddIndex(
                    model_name='cart',
                    index=models.Index(fields=['user', 'is_deleted'], name='carts_user_is_deleted_idx'),
                ),
                migrations.AddIndex(
                    model_name='cartitem',
                    index=models.Index(fields=['cart'], name='cart_items_cart_idx'),
                ),
                migrations.AddIndex(
                    model_name='cartitem',
                    index=models.Index(fields=['product'], name='cart_items_product_idx'),
                ),
                migrations.AddIndex(
                    model_name='cartitem',
                    index=models.Index(fields=['cart', 'is_deleted'], name='cart_items_cart_is_deleted_idx'),
                ),
                migrations.AlterUniqueTogether(
                    name='cartitem',
                    unique_together={('cart', 'product')},
                ),
            ],
            database_operations=[],
        ),
    ]
