"""
Custom migrate command that handles pre-existing database schemas.

This command checks if the database was set up using schema.sql (tables exist
but django_migrations table is missing or empty) and fakes the initial
migrations for built-in Django apps accordingly.
"""

from django.core.management.commands.migrate import Command as MigrateCommand
from django.db import connection


class Command(MigrateCommand):
    help = 'Migrate database, handling pre-existing schema from schema.sql'

    SCHEMA_TABLES = [
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
        if self._should_fake_builtin_migrations():
            self.stdout.write(self.style.WARNING(
                'Detected pre-existing schema — faking built-in Django migrations...'
            ))
            self._ensure_migrations_table()
            self._fake_builtin_migrations()

        super().handle(*args, **options)

    def _should_fake_builtin_migrations(self):
        """
        Return True when the application tables already exist in the DB
        but the django_migrations table has no records for built-in apps.
        This covers two cases:
          1. django_migrations table doesn't exist at all.
          2. django_migrations table exists but is empty.
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public'
                          AND table_name = 'users'
                    )
                """)
                users_table_exists = cursor.fetchone()[0]

                if not users_table_exists:
                    return False

                cursor.execute("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public'
                          AND table_name = 'django_migrations'
                    )
                """)
                migrations_table_exists = cursor.fetchone()[0]

                if not migrations_table_exists:
                    return True

                cursor.execute(
                    "SELECT COUNT(*) FROM django_migrations WHERE app IN ('auth','contenttypes','sessions','admin')"
                )
                count = cursor.fetchone()[0]
                return count == 0

        except Exception as e:
            self.stderr.write(f'Error checking migration state: {e}')
            return False

    def _ensure_migrations_table(self):
        """Create django_migrations table if it does not exist."""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS django_migrations (
                        id BIGSERIAL PRIMARY KEY,
                        app VARCHAR(255) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        applied TIMESTAMP WITH TIME ZONE NOT NULL
                    )
                """)
        except Exception as e:
            self.stderr.write(f'Error creating django_migrations table: {e}')

    def _fake_builtin_migrations(self):
        """Fake all migrations for built-in Django apps."""
        from django.core.management import call_command

        builtin_apps = ['contenttypes', 'auth', 'sessions', 'admin']

        for app_label in builtin_apps:
            try:
                call_command('migrate', app_label, '--fake', verbosity=0)
                self.stdout.write(f'  Faked migrations for: {app_label}')
            except Exception as e:
                self.stdout.write(self.style.WARNING(
                    f'  Warning: Could not fake {app_label}: {e}'
                ))

        self.stdout.write(self.style.SUCCESS('Built-in migrations faked successfully.'))
