from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('users', '0002_add_auth_fields'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        CREATE TABLE IF NOT EXISTS users_groups (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
                            group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
                            UNIQUE(user_id, group_id)
                        );
                        CREATE TABLE IF NOT EXISTS users_user_permissions (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
                            permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
                            UNIQUE(user_id, permission_id)
                        );
                    """,
                    reverse_sql="""
                        DROP TABLE IF EXISTS users_user_permissions;
                        DROP TABLE IF EXISTS users_groups;
                    """,
                ),
            ],
        ),
    ]
