from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0023_customerbanner"),
    ]

    operations = [
        migrations.AddField(
            model_name="customer",
            name="register_number",
            field=models.CharField(blank=True, max_length=20, null=True, unique=True, verbose_name="Регистрийн дугаар"),
        ),
        migrations.AddField(
            model_name="customer",
            name="software_limit",
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name="Програм хангамжийн хязгаар"),
        ),
        migrations.AddField(
            model_name="customer",
            name="advisory_limit",
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name="Зөвлөх үйлчилгээний хязгаар"),
        ),
        migrations.AddField(
            model_name="customer",
            name="article_limit",
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name="Нийтлэлийн хязгаар"),
        ),
    ]
