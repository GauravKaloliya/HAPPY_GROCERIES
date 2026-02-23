from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activity_logs', '0003_rename_activity_log_action_created_idx_act_log_act_created_idx'),
    ]

    operations = [
        migrations.AddField(
            model_name='activitylog',
            name='device_type',
            field=models.CharField(
                blank=True,
                db_index=True,
                max_length=20,
                null=True,
                choices=[
                    ('mobile', 'Mobile'),
                    ('web', 'Web'),
                    ('tablet', 'Tablet'),
                    ('desktop', 'Desktop'),
                    ('other', 'Other'),
                ]
            ),
        ),
    ]