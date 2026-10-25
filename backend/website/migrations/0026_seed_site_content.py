from django.db import migrations


PROCESS_STEPS = [
    (
        "🧭",
        "Бүртгэл үүсгэх",
        "Системд бүртгүүлж, өөрийн хэрэгцээнд тохирсон программ хангамж болон зөвлөх үйлчилгээг хайх эхний алхмаа хийгээрэй.",
    ),
    (
        "📝",
        "Тохирох үйлчилгээгээ сонгох",
        "Үйлчилгээний төрөл, салбараар хайж, боломж болон мэдээлэлтэй танилцан өөрт тохирсон үйлчилгээг сонгоорой.",
    ),
    (
        "🚀",
        "Санал хүсэлтээ хуваалцах",
        "Үйлчилгээ авсны дараа үнэлгээ өгч, сэтгэгдлээ үлдээн бусад хэрэглэгчдэд мэдээлэл хүргэж, үйлчилгээний чанарыг сайжруулахад хувь нэмрээ оруулаарай.",
    ),
]

FOOTER_LINKS = [
    ("user", "Топ программ хангамж", "/footer/top_software"),
    ("user", "Топ зөвлөх үйлчилгээ", "/footer/top_advisory"),
    ("user", "Топ нийтлэл", "/footer/top_article"),
    ("org", "Мэдээлэл шинэчлэх", "/footer/update_info"),
    ("org", "Бүтээгдэхүүн шинэчлэх", "/footer/update_product"),
    ("org", "Нийтлэл оруулах", "/footer/submit_article"),
    ("company", "Бидний тухай", "/company#about"),
    ("company", "Үнийн санал", "/company#pricing"),
    ("company", "Холбоо барих", "/company#contact"),
]


def seed(apps, schema_editor):
    ProcessSection = apps.get_model("website", "ProcessSection")
    ProcessStep = apps.get_model("website", "ProcessStep")
    FooterLink = apps.get_model("website", "FooterLink")
    SiteSetting = apps.get_model("website", "SiteSetting")
    Category = apps.get_model("website", "Category")

    section, _ = ProcessSection.objects.get_or_create(pk=1)
    if not ProcessStep.objects.filter(section=section).exists():
        for index, (icon, title, text) in enumerate(PROCESS_STEPS, start=1):
            ProcessStep.objects.create(section=section, icon=icon, title=title, text=text, sort_order=index)

    if not FooterLink.objects.exists():
        counters = {}
        for column, label, url in FOOTER_LINKS:
            counters[column] = counters.get(column, 0) + 1
            FooterLink.objects.create(column=column, label=label, url=url, sort_order=counters[column])

    SiteSetting.objects.get_or_create(pk=1)

    # Одоогийн дарааллыг хадгалахын тулд sort_order-ыг id-аар эхлүүлнэ.
    for category in Category.objects.all():
        if not category.sort_order:
            category.sort_order = category.id
            category.save(update_fields=["sort_order"])


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0025_site_content_admin"),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
