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

    # Django built-in app migrations that need to be faked (in dependency order)
    DJANGO_BUILTIN_MIGRATIONS = [
        ('contenttypes', '0001_initial'),
        ('contenttypes', '0002_remove_content_type_name'),
        ('auth', '0001_initial'),
        ('auth', '0002_alter_permission_name_max_length'),
        ('auth', '0003_alter_user_email_max_length'),
        ('auth', '0004_alter_user_username_opts'),
        ('auth', '0005_alter_user_last_login_null'),
        ('auth', '0006_require_contenttypes_0002'),
        ('auth', '0007_alter_validators_add_error_messages'),
        ('auth', '0008_alter_user_username_max_length'),
        ('auth', '0009_alter_user_last_name_max_length'),
        ('auth', '0010_alter_group_name_max_length'),
        ('auth', '0011_update_proxy_permissions'),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('admin', '0001_initial'),
        ('admin', '0002_logentry_remove_auto_add'),
        ('admin', '0003_logentry_add_action_flag_choices'),
        ('sessions', '0001_initial'),
    ]

    # Local app tables to check for existence
    LOCAL_APP_TABLES = {
        'users': 'users',
        'products': 'products',
        'cart': 'carts',
        'orders': 'orders',
        'coupons': 'coupons',
        'wishlist': 'wishlist_items',
        'activity_logs': 'activity_logs',
        'contact': 'contact_messages',
        'site_config': 'site_settings',
        'reviews': 'product_reviews',
    }

    # Known migration files for local apps (in order)
    LOCAL_APP_MIGRATIONS = {
        'users': ['0001_initial', '0002_soft_delete_fields', '0003_user_address'],
        'products': ['0001_initial', '0002_soft_delete_fields', '0003_seed_initial_data', '0004_category_color', '0005_combo', '0006_seed_combo_data'],
        'cart': ['0001_initial', '0002_initial', '0003_soft_delete_fields'],
        'orders': ['0001_initial', '0002_initial', '0003_soft_delete_fields', '0004_fix_delivery_phone_maxlength'],
        'coupons': ['0001_initial', '0002_initial', '0003_initial', '0004_soft_delete_fields'],
        'wishlist': ['0001_initial'],
        'activity_logs': ['0001_initial', '0002_alter_activitylog_action_alter_activitylog_id_and_more', '0003_rename_activity_log_action_created_idx_act_log_act_created_idx'],
        'contact': ['0001_initial', '0002_alter_contactmessage_id_and_more'],
        'site_config': ['0001_initial'],
        'reviews': ['0001_initial'],
    }

    def handle(self, *args, **options):
        # Check if we need to fake migrations
        if self._should_fake_migrations():
            self.stdout.write(self.style.WARNING('Detected pre-existing schema, recording migrations...'))
            self._record_initial_migrations()
        
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
                
                # If migrations table is empty but django_content_type exists,
                # schema was loaded from schema.sql
                if count == 0:
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

    def _record_initial_migrations(self):
        """Record migrations in django_migrations table for existing schema."""
        applied_time = timezone.now()
        
        with connection.cursor() as cursor:
            # Record Django built-in migrations
            for app_label, migration in self.DJANGO_BUILTIN_MIGRATIONS:
                self._record_migration(cursor, app_label, migration, applied_time)
            
            # Record local app migrations
            for app_label, table_name in self.LOCAL_APP_TABLES.items():
                if self._table_exists(table_name):
                    migrations = self.LOCAL_APP_MIGRATIONS.get(app_label, [])
                    for migration in migrations:
                        self._record_migration(cursor, app_label, migration, applied_time)
        
        self.stdout.write(self.style.SUCCESS('Successfully recorded existing migrations.'))

    def _table_exists(self, table_name):
        """Check if a table exists in the database."""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    )
                """, [table_name])
                return cursor.fetchone()[0]
        except Exception:
            return False

    def _record_migration(self, cursor, app_label, migration_name, applied_time):
        """Insert a migration record into django_migrations table."""
        try:
            # Check if already recorded
            cursor.execute(
                "SELECT COUNT(*) FROM django_migrations WHERE app = %s AND name = %s",
                [app_label, migration_name]
            )
            if cursor.fetchone()[0] > 0:
                return
            
            # Insert the migration record
            cursor.execute(
                "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, %s)",
                [app_label, migration_name, applied_time]
            )
            self.stdout.write(f'  Recorded: {app_label}.{migration_name}')
        except Exception as e:
            self.stdout.write(f'  Warning: Could not record {app_label}.{migration_name}: {e}')
