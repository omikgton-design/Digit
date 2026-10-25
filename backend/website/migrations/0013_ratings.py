from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0012_approval_status"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SoftwareRating",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.PositiveSmallIntegerField()),
                ("created_date", models.DateTimeField(auto_now_add=True)),
                ("update_date", models.DateTimeField(auto_now=True)),
                ("software", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ratings", to="website.software")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="software_ratings", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-update_date"],
            },
        ),
        migrations.CreateModel(
            name="AdvisoryRating",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.PositiveSmallIntegerField()),
                ("created_date", models.DateTimeField(auto_now_add=True)),
                ("update_date", models.DateTimeField(auto_now=True)),
                ("advisory_service", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ratings", to="website.advisoryservice")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="advisory_ratings", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-update_date"],
            },
        ),
        migrations.AddConstraint(
            model_name="softwarerating",
            constraint=models.UniqueConstraint(fields=("software", "user"), name="unique_software_rating"),
        ),
        migrations.AddConstraint(
            model_name="advisoryrating",
            constraint=models.UniqueConstraint(fields=("advisory_service", "user"), name="unique_advisory_rating"),
        ),
    ]
