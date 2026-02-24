import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='ActivityLog',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('action', models.CharField(choices=[('page_view', 'Page View'), ('product_view', 'Product View'), ('add_to_cart', 'Add to Cart'), ('remove_from_cart', 'Remove from Cart'), ('search', 'Search'), ('filter_apply', 'Filter Apply'), ('add_to_wishlist', 'Add to Wishlist'), ('remove_from_wishlist', 'Remove from Wishlist'), ('coupon_apply', 'Coupon Apply'), ('checkout', 'Checkout'), ('login', 'Login'), ('logout', 'Logout'), ('signup', 'Signup'), ('contact_form', 'Contact Form Submit'), ('profile_update', 'Profile Update'), ('settings_change', 'Settings Change')], db_index=True, max_length=50)),
                        ('page', models.CharField(db_index=True, max_length=255)),
                        ('details', models.JSONField(default=dict)),
                        ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                        ('user_agent', models.TextField(blank=True)),
                        ('session_id', models.CharField(blank=True, db_index=True, max_length=255)),
                        ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                        ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='activity_logs', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'verbose_name': 'Activity Log',
                        'verbose_name_plural': 'Activity Logs',
                        'db_table': 'activity_logs',
                        'ordering': ['-created_at'],
                        'indexes': [
                            models.Index(fields=['user', 'created_at'], name='act_log_user_created_idx'),
                            models.Index(fields=['action', 'created_at'], name='act_log_action_created_idx'),
                            models.Index(fields=['page'], name='act_log_page_idx'),
                            models.Index(fields=['session_id'], name='act_log_session_id_idx'),
                            models.Index(fields=['user'], name='act_log_user_idx'),
                        ],
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
