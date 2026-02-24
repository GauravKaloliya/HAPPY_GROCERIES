import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='Coupon',
                    fields=[
                        ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('code', models.CharField(db_index=True, max_length=20, unique=True)),
                        ('description', models.TextField(default='')),
                        ('coupon_type', models.CharField(choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount'), ('category', 'Category-based')], default='percentage', max_length=20)),
                        ('value', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(0)])),
                        ('min_order_value', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('max_discount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, validators=[django.core.validators.MinValueValidator(0)])),
                        ('applicable_categories', models.JSONField(default=list)),
                        ('first_order_only', models.BooleanField(default=False)),
                        ('usage_limit', models.PositiveIntegerField(blank=True, default=None, null=True)),
                        ('usage_count', models.PositiveIntegerField(default=0)),
                        ('is_active', models.BooleanField(default=True)),
                        ('valid_from', models.DateTimeField(blank=True, null=True)),
                        ('valid_until', models.DateTimeField(blank=True, null=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                    ],
                    options={
                        'db_table': 'coupons',
                        'ordering': ['-created_at'],
                        'indexes': [
                            models.Index(fields=['code', 'is_active'], name='coupons_code_is_active_idx'),
                            models.Index(fields=['is_active', 'valid_until'], name='coupons_active_valid_idx'),
                            models.Index(fields=['is_deleted'], name='coupons_is_deleted_idx'),
                        ],
                    },
                ),
                migrations.CreateModel(
                    name='CouponUsage',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('discount_amount', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                        ('used_at', models.DateTimeField(auto_now_add=True)),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                        ('coupon', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usages', to='coupons.coupon')),
                        ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='coupon_usages', to='orders.order')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='coupon_usages', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'coupon_usages',
                        'indexes': [
                            models.Index(fields=['user'], name='cu_user_idx'),
                            models.Index(fields=['coupon'], name='cu_coupon_idx'),
                            models.Index(fields=['order'], name='cu_order_idx'),
                            models.Index(fields=['user', 'is_deleted'], name='cu_user_is_deleted_idx'),
                            models.Index(fields=['coupon', 'is_deleted'], name='cu_coupon_is_deleted_idx'),
                            models.Index(fields=['is_deleted'], name='cu_is_deleted_idx'),
                        ],
                        'unique_together': {('user', 'coupon')},
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
