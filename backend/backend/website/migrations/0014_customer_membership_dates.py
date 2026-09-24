from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0013_ratings"),
    ]

    operations = [
        migrations.AddField(
            model_name="customer",
            name="membership_paid_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="customer",
            name="membership_end_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
