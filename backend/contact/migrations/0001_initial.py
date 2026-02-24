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
                    name='ContactMessage',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('name', models.CharField(max_length=255)),
                        ('email', models.EmailField(max_length=254)),
                        ('message', models.TextField()),
                        ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('resolved', 'Resolved'), ('closed', 'Closed')], default='pending', max_length=20)),
                        ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                        ('user_agent', models.TextField(blank=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='contact_messages', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'verbose_name': 'Contact Message',
                        'verbose_name_plural': 'Contact Messages',
                        'db_table': 'contact_messages',
                        'ordering': ['-created_at'],
                        'indexes': [
                            models.Index(fields=['user'], name='contact_messages_user_idx'),
                            models.Index(fields=['status'], name='contact_messages_status_idx'),
                            models.Index(fields=['created_at'], name='contact_messages_created_idx'),
                        ],
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
