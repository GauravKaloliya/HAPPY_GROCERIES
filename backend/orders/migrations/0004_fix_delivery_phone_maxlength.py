from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_soft_delete_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='delivery_phone',
            field=models.CharField(max_length=15),
        ),
    ]
