from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0011_article"),
    ]

    operations = [
        migrations.AddField(
            model_name="software",
            name="is_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="advisoryservice",
            name="is_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="article",
            name="is_approved",
            field=models.BooleanField(default=False),
        ),
    ]
