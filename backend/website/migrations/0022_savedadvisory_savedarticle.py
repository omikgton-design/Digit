from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):
    dependencies = [("website", "0021_savedsoftware"), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name="SavedAdvisory", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("created_date", models.DateTimeField(auto_now_add=True)), ("advisory_service", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="saved_by_users", to="website.advisoryservice")), ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="saved_advisories", to=settings.AUTH_USER_MODEL))], options={"ordering": ["-created_date"], "unique_together": {("user", "advisory_service")}}),
        migrations.CreateModel(name="SavedArticle", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("created_date", models.DateTimeField(auto_now_add=True)), ("article", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="saved_by_users", to="website.article")), ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="saved_articles", to=settings.AUTH_USER_MODEL))], options={"ordering": ["-created_date"], "unique_together": {("user", "article")}}),
    ]
