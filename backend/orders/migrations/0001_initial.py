import django.core.validators
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
                    name='Order',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('order_id', models.CharField(db_index=True, max_length=20, unique=True)),
                        ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('processing', 'Processing'), ('shipped', 'Shipped'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                        ('delivery_type', models.CharField(choices=[('standard', 'Standard'), ('express', 'Express')], default='standard', max_length=20)),
                        ('subtotal', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('tax', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('applied_discount_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('delivery_charge', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('coupon_discount', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('total', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('delivery_name', models.CharField(max_length=100)),
                        ('delivery_phone', models.CharField(max_length=15)),
                        ('delivery_address', models.TextField()),
                        ('delivery_instructions', models.TextField(default='')),
                        ('estimated_delivery', models.DateTimeField(blank=True, null=True)),
                        ('delivered_at', models.DateTimeField(blank=True, null=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'orders',
                        'ordering': ['-created_at'],
                    },
                ),
                migrations.CreateModel(
                    name='OrderItem',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('product_name', models.CharField(max_length=100)),
                        ('product_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('product_emoji', models.CharField(default='', max_length=10)),
                        ('quantity', models.PositiveIntegerField()),
                        ('discount_percent', models.PositiveIntegerField(default=0)),
                        ('applied_discount_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('subtotal', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                        ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order')),
                        ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='order_items', to='products.product')),
                    ],
                    options={
                        'db_table': 'order_items',
                    },
                ),
                migrations.AddIndex(
                    model_name='order',
                    index=models.Index(fields=['user', 'status'], name='orders_user_status_idx'),
                ),
                migrations.AddIndex(
                    model_name='order',
                    index=models.Index(fields=['is_deleted'], name='orders_is_deleted_idx'),
                ),
                migrations.AddIndex(
                    model_name='order',
                    index=models.Index(fields=['user', 'created_at'], name='orders_user_created_idx'),
                ),
                migrations.AddIndex(
                    model_name='order',
                    index=models.Index(fields=['applied_discount_amount'], name='orders_applied_discount_idx'),
                ),
                migrations.AddIndex(
                    model_name='orderitem',
                    index=models.Index(fields=['order'], name='oi_order_idx'),
                ),
                migrations.AddIndex(
                    model_name='orderitem',
                    index=models.Index(fields=['product'], name='oi_product_idx'),
                ),
                migrations.AddIndex(
                    model_name='orderitem',
                    index=models.Index(fields=['order', 'is_deleted'], name='oi_order_is_deleted_idx'),
                ),
                migrations.AddIndex(
                    model_name='orderitem',
                    index=models.Index(fields=['is_deleted'], name='oi_is_deleted_idx'),
                ),
                migrations.AddIndex(
                    model_name='orderitem',
                    index=models.Index(fields=['applied_discount_amount'], name='oi_applied_disc_idx'),
                ),
            ],
            database_operations=[],
        ),
    ]
