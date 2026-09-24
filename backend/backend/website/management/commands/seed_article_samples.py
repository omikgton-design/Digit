from __future__ import annotations

from datetime import date, timedelta
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from website.models import Article, Category, Customer


class Command(BaseCommand):
    help = "Seed article sample records with images"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=50)
        parser.add_argument("--reset", action="store_true")

    def handle(self, *args, **options):
        count = max(1, options["count"])
        reset = options["reset"]

        User = get_user_model()
        admin_user, _ = User.objects.get_or_create(
            username="sampleadmin",
            defaults={
                "email": "sampleadmin@example.com",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if not admin_user.is_staff or not admin_user.is_superuser:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save(update_fields=["is_staff", "is_superuser"])

        article_type_names = [
            "Мэдээ",
            "Тойм",
            "Судалгаа",
            "Зөвлөгөө",
            "Ярилцлага",
            "Шинэчлэл",
        ]
        article_types = [
            Category.objects.get_or_create(name=name, type=Category.TYPE_ARTICLE)[0]
            for name in article_type_names
        ]

        organizations = []
        for i in range(1, 11):
            org_user, _ = User.objects.get_or_create(
                username=f"samplearticle{i:02d}",
                defaults={"email": f"samplearticle{i:02d}@example.com"},
            )
            organization, _ = Customer.objects.get_or_create(
                user=org_user,
                defaults={
                    "name": f"Sample Article Organization {i:02d}",
                    "email": org_user.email or f"samplearticle{i:02d}@example.com",
                    "account_type": Customer.ACCOUNT_ORG,
                    "type": Customer.TYPE_SILVER if i % 2 else Customer.TYPE_GOLD,
                },
            )
            organizations.append(organization)

        if reset:
            sample_qs = Article.objects.filter(title__startswith="Sample Article ")
            deleted_count = sample_qs.count()
            sample_qs.delete()
            self.stdout.write(self.style.WARNING(f"Deleted old sample articles: {deleted_count}"))

        prefixes = ["Digital", "Growth", "Smart", "Future", "Insight", "Market", "Scale", "Core", "Next", "Impact"]
        topics = ["Outlook", "Report", "Guide", "Update", "Brief", "Review", "Trends", "Strategy"]
        intros = [
            "Байгууллагын дижитал хөгжил, зах зээлийн чиг хандлага, хэрэгжүүлж болох бодит алхмуудын тухай нийтлэл.",
            "Салбарын өөрчлөлт, эрэлт хэрэгцээ, хэрэгжүүлэлтийн туршлагыг нэгтгэсэн товч бөгөөд хэрэгтэй агуулга.",
            "Шийдвэр гаргагчдад зориулсан практик зөвлөмж, бодит жишээ, хэрэгжүүлэх дараалал бүхий танилцуулга.",
            "Зах зээлийн нөхцөл байдал, технологийн нөлөө, байгууллагын бэлэн байдлыг хамарсан дэлгэрэнгүй мэдээлэл.",
        ]
        detail_blocks = [
            "Энэхүү нийтлэл нь өнөөгийн нөхцөл байдал, тулгамдсан асуудал, боломжит шийдлүүдийг жишээтэйгээр тайлбарлана.",
            "Мөн хэрэгжүүлэлтийн үе шат, анхаарах эрсдэл, хөрөнгө оруулалтын өгөөжид нөлөөлөх хүчин зүйлсийг багтаасан.",
            "Байгууллагын дотоод процесс, багийн уялдаа, технологийн сонголтын үр нөлөөг харьцуулсан дүгнэлт оруулсан.",
            "Удирдлагын түвшний шийдвэр гаргалтад ашиглаж болох товч зөвлөмж болон дараагийн алхмуудыг санал болгосон.",
        ]

        start_date = date(2024, 1, 10)

        for idx in range(1, count + 1):
            code = f"{idx:03d}"
            article_type = article_types[idx % len(article_types)]
            title = f"Sample Article {code} - {prefixes[idx % len(prefixes)]} {topics[idx % len(topics)]}"
            description = (
                f"{intros[idx % len(intros)]}\n\n"
                f"{detail_blocks[idx % len(detail_blocks)]}\n\n"
                f"Жишээ нийтлэлийн код: {code}\n"
                f"Нийтлэлийн төрөл: {article_type.name}\n"
                f"Зорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг."
            )

            Article.objects.create(
                title=title,
                article_type=article_type,
                organization=organizations[idx % len(organizations)],
                image=ContentFile(self._generate_image_bytes(idx, title, article_type.name), name=f"sample_article_{code}.png"),
                published_date=start_date + timedelta(days=idx * 5),
                description=description,
                is_approved=True,
                is_featured=idx <= min(12, count),
                created_by=admin_user,
            )

        self.stdout.write(self.style.SUCCESS(f"Created {count} article sample records with images."))

    def _generate_image_bytes(self, idx: int, title: str, category_name: str) -> bytes:
        width, height = 1200, 720
        hue = (idx * 23) % 360
        bg = self._hsv_to_rgb(hue, 0.28, 0.96)
        accent = self._hsv_to_rgb((hue + 150) % 360, 0.8, 0.72)

        img = Image.new("RGB", (width, height), bg)
        draw = ImageDraw.Draw(img)

        draw.rounded_rectangle((48, 48, width - 48, height - 48), radius=34, outline=accent, width=6)
        draw.rectangle((80, 90, width - 80, 210), fill=(255, 255, 255))
        draw.rectangle((80, 250, width - 320, height - 110), fill=(255, 255, 255))
        draw.rounded_rectangle((80, 32, 340, 86), radius=27, fill=(245, 245, 245))

        draw.text((110, 48), category_name[:24], fill=(40, 44, 56))
        draw.text((110, 130), title[:56], fill=(38, 46, 60))
        draw.text((110, 292), "Article sample image", fill=accent)
        draw.text((110, 340), "Digit Newsroom", fill=(74, 78, 86))

        for stripe in range(5):
            offset = 150 + stripe * 32
            draw.line((width - 220, offset, width - 120, offset + 78), fill=accent, width=7)

        out = BytesIO()
        img.save(out, format="PNG", optimize=True)
        return out.getvalue()

    def _hsv_to_rgb(self, h: int, s: float, v: float) -> tuple[int, int, int]:
        h = float(h)
        i = int(h / 60.0) % 6
        f = (h / 60.0) - i
        p = v * (1.0 - s)
        q = v * (1.0 - f * s)
        t = v * (1.0 - (1.0 - f) * s)
        channels = {
            0: (v, t, p),
            1: (q, v, p),
            2: (p, v, t),
            3: (p, q, v),
            4: (t, p, v),
            5: (v, p, q),
        }[i]
        return tuple(int(c * 255) for c in channels)
