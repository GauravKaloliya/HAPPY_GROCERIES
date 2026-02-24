import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[],
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE users
                            ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT FALSE,
                            ADD COLUMN IF NOT EXISTS date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
                    """,
                    reverse_sql="""
                        ALTER TABLE users
                            DROP COLUMN IF EXISTS is_staff,
                            DROP COLUMN IF EXISTS date_joined;
                    """,
                ),
            ],
        ),
    ]
