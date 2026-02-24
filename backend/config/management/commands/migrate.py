"""
Custom migrate command that handles pre-existing database schemas.

This command checks if the database was set up using schema.sql (tables exist
but migrations aren't recorded) and fakes the initial migrations accordingly.
"""

from django.core.management.commands.migrate import Command as MigrateCommand
from django.db import connection
from django.utils import timezone


class Command(MigrateCommand):
    help = 'Migrate database, handling pre-existing schema from schema.sql'

    # Tables that indicate schema.sql was used
    SCHEMA_TABLES = [
        'django_content_type',
        'auth_permission',
        'auth_group',
        'users',
        'categories',
        'brands',
        'products',
        'carts',
        'cart_items',
        'orders',
        'order_items',
        'coupons',
        'coupon_usages',
        'wishlist_items',
        'product_reviews',
        'review_helpful_votes',
        'activity_logs',
        'contact_messages',
        'site_settings',
        'sort_options',
        'combos',
        'combos_products',
    ]

    def handle(self, *args, **options):
        # Check if we need to fake migrations
        if self._should_fake_migrations():
            self.stdout.write(self.style.WARNING('Detected pre-existing schema from schema.sql, faking migrations...'))
            self._fake_all_migrations()
        
        # Run the normal migrate command
        super().handle(*args, **options)

    def _should_fake_migrations(self):
        """Check if tables exist but migrations aren't recorded."""
        try:
            with connection.cursor() as cursor:
                # Check if django_migrations table exists
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'django_migrations'
                    )
                """)
                if not cursor.fetchone()[0]:
                    return False
                
                # Check if there are any migration records
                cursor.execute("SELECT COUNT(*) FROM django_migrations")
                count = cursor.fetchone()[0]
                
                # If migrations table is empty but key tables exist,
                # schema was loaded from schema.sql
                if count == 0:
                    # Check for django_content_type which is created by schema.sql
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = 'django_content_type'
                        )
                    """)
                    return cursor.fetchone()[0]
                
                return False
        except Exception as e:
            self.stderr.write(f'Error checking migration state: {e}')
            return False

    def _fake_all_migrations(self):
        """Fake all migrations for apps where tables already exist."""
        from django.core.management import call_command
        from django.apps import apps
        
        # Get all app labels that have migrations
        app_configs = apps.get_app_configs()
        
        for app_config in app_configs:
            if app_config.label in ['admin', 'auth', 'contenttypes', 'sessions']:
                # Fake Django built-in app migrations
                try:
                    call_command('migrate', app_config.label, fake=True, verbosity=0)
                    self.stdout.write(f'  Faked migrations for: {app_config.label}')
                except Exception as e:
                    self.stdout.write(f'  Warning: Could not fake {app_config.label}: {e}')
            elif app_config.label in ['users', 'products', 'cart', 'orders', 'coupons', 
                                       'wishlist', 'activity_logs', 'contact', 'site_config', 'reviews']:
                # Fake local app migrations
                try:
                    call_command('migrate', app_config.label, fake=True, verbosity=0)
                    self.stdout.write(f'  Faked migrations for: {app_config.label}')
                except Exception as e:
                    self.stdout.write(f'  Warning: Could not fake {app_config.label}: {e}')
        
        self.stdout.write(self.style.SUCCESS('Successfully faked all existing migrations.'))
