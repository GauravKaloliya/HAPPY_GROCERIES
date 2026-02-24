import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0001_initial'),
        ('products', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='ProductReview',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('rating', models.PositiveIntegerField(choices=[(1, '1 - Poor'), (2, '2 - Fair'), (3, '3 - Good'), (4, '4 - Very Good'), (5, '5 - Excellent')], help_text='Rating from 1 to 5 stars', validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                        ('title', models.CharField(default='', max_length=100)),
                        ('comment', models.TextField(help_text='Review feedback', max_length=1000)),
                        ('is_approved', models.BooleanField(default=True)),
                        ('is_verified_purchase', models.BooleanField(default=True, help_text='Verified as purchased')),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('is_deleted', models.BooleanField(default=False)),
                        ('deleted_at', models.DateTimeField(blank=True, null=True)),
                        ('order', models.ForeignKey(help_text='The order that contained this product', on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='orders.order')),
                        ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='products.product')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'product_reviews',
                        'ordering': ['-created_at'],
                    },
                ),
                migrations.CreateModel(
                    name='ReviewHelpful',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='helpful_votes', to='reviews.productreview')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='review_votes', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'review_helpful_votes',
                    },
                ),
                migrations.AddIndex(
                    model_name='productreview',
                    index=models.Index(fields=['product', 'is_approved', 'is_deleted'], name='pr_prod_approved_deleted_idx'),
                ),
                migrations.AddIndex(
                    model_name='productreview',
                    index=models.Index(fields=['user', 'is_deleted'], name='pr_user_is_deleted_idx'),
                ),
                migrations.AddIndex(
                    model_name='productreview',
                    index=models.Index(fields=['rating'], name='pr_rating_idx'),
                ),
                migrations.AlterUniqueTogether(
                    name='productreview',
                    unique_together={('user', 'product', 'order')},
                ),
                migrations.AddIndex(
                    model_name='reviewhelpful',
                    index=models.Index(fields=['review'], name='rhv_review_idx'),
                ),
                migrations.AddIndex(
                    model_name='reviewhelpful',
                    index=models.Index(fields=['user'], name='rhv_user_idx'),
                ),
                migrations.AlterUniqueTogether(
                    name='reviewhelpful',
                    unique_together={('review', 'user')},
                ),
            ],
            database_operations=[],
        ),
    ]
