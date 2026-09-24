from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0015_customer_membership_payment_history"),
    ]

    operations = [
        migrations.CreateModel(
            name="FooterMenuContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "key",
                    models.CharField(
                        choices=[
                            ("top_software", "Топ программ хангамж"),
                            ("top_advisory", "Топ зөвлөх үйлчилгээ"),
                            ("top_article", "Топ нийтлэл"),
                            ("update_info", "Мэдээлэл шинэчлэх"),
                            ("update_product", "Бүтээгдэхүүн шинэчлэх"),
                            ("submit_article", "Нийтлэл оруулах"),
                            ("about", "Бидний тухай"),
                            ("pricing", "Үнийн санал"),
                            ("contact", "Холбоо барих"),
                        ],
                        max_length=50,
                        unique=True,
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("image", models.ImageField(blank=True, null=True, upload_to="footer_menu_content/")),
                ("content", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_date", models.DateTimeField(auto_now_add=True)),
                ("update_date", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["key"],
            },
        ),
    ]
