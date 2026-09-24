from __future__ import annotations

from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from website.models import AdvisoryPriceTerm, AdvisoryService, AdvisoryServiceImage, AdvisoryServiceType, Category, Customer


class Command(BaseCommand):
    help = "Seed advisory service sample records with images"

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

        advisory_sector_names = [
            "Finance",
            "Retail",
            "Education",
            "Healthcare",
            "Construction",
            "Agriculture",
            "Logistics",
            "Manufacturing",
        ]
        advisory_sectors = [
            Category.objects.get_or_create(name=name, type=Category.TYPE_ADVISORY)[0]
            for name in advisory_sector_names
        ]

        service_types = [
            AdvisoryServiceType.objects.get_or_create(key="management", defaults={"name": "Удирдлагын зөвлөх", "sort_order": 1})[0],
            AdvisoryServiceType.objects.get_or_create(key="finance", defaults={"name": "Санхүүгийн зөвлөх", "sort_order": 2})[0],
            AdvisoryServiceType.objects.get_or_create(key="marketing", defaults={"name": "Маркетингийн зөвлөх", "sort_order": 3})[0],
            AdvisoryServiceType.objects.get_or_create(key="hr", defaults={"name": "Хүний нөөцийн зөвлөх", "sort_order": 4})[0],
            AdvisoryServiceType.objects.get_or_create(key="operations", defaults={"name": "Үйл ажиллагааны зөвлөх", "sort_order": 5})[0],
            AdvisoryServiceType.objects.get_or_create(key="digital", defaults={"name": "Дижитал шилжилтийн зөвлөх", "sort_order": 6})[0],
        ]
        price_terms = [
            AdvisoryPriceTerm.objects.get_or_create(key="fixed", defaults={"name": "Төслөөр", "sort_order": 1})[0],
            AdvisoryPriceTerm.objects.get_or_create(key="monthly", defaults={"name": "Сараар", "sort_order": 2})[0],
            AdvisoryPriceTerm.objects.get_or_create(key="hourly", defaults={"name": "Цагаар", "sort_order": 3})[0],
            AdvisoryPriceTerm.objects.get_or_create(key="custom", defaults={"name": "Тохиролцоно", "sort_order": 4})[0],
        ]

        companies = []
        for i in range(1, 11):
            company_user, _ = User.objects.get_or_create(
                username=f"sampleadvisory{i:02d}",
                defaults={"email": f"sampleadvisory{i:02d}@example.com"},
            )
            company, _ = Customer.objects.get_or_create(
                user=company_user,
                defaults={
                    "name": f"Sample Advisory Company {i:02d}",
                    "email": company_user.email or f"sampleadvisory{i:02d}@example.com",
                    "account_type": Customer.ACCOUNT_ORG,
                    "type": Customer.TYPE_SILVER if i % 2 else Customer.TYPE_GOLD,
                },
            )
            companies.append(company)

        if reset:
            sample_qs = AdvisoryService.objects.filter(title__startswith="Sample Advisory ")
            deleted_count = sample_qs.count()
            sample_qs.delete()
            self.stdout.write(self.style.WARNING(f"Deleted old sample advisories: {deleted_count}"))

        prefixes = ["Growth", "Vision", "Impact", "Prime", "Scale", "Smart", "Core", "Vertex", "Agile", "Next"]
        focuses = ["Transformation", "Planning", "Acceleration", "Optimization", "Blueprint", "Launch", "Operations", "Expansion"]
        intros = [
            "Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.",
            "Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.",
            "Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.",
            "Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.",
        ]
        details = [
            "Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.",
            "Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.",
            "Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.",
            "Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.",
        ]
        client_sets = [
            "Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C",
            "Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F",
            "Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I",
            "Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L",
        ]

        for idx in range(1, count + 1):
            code = f"{idx:03d}"
            service_type = service_types[idx % len(service_types)]
            title = f"Sample Advisory {code} - {prefixes[idx % len(prefixes)]} {focuses[idx % len(focuses)]}"
            advisory = AdvisoryService.objects.create(
                title=title,
                service_type=service_type,
                service_start_year=2017 + (idx % 9),
                company=companies[idx % len(companies)],
                introduction=intros[idx % len(intros)],
                description=(
                    f"{details[idx % len(details)]}\n\n"
                    f"Жишээ үйлчилгээний код: {code}\n"
                    f"Хэрэгжүүлэх чиглэл: {service_type.name}\n"
                    f"Зорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани."
                ),
                price_terms=price_terms[idx % len(price_terms)],
                price=1500000 + idx * 85000,
                client_organizations=client_sets[idx % len(client_sets)],
                is_approved=True,
                is_featured=idx <= min(12, count),
                created_by=admin_user,
            )

            sector_count = 2 + (idx % 2)
            start = idx % len(advisory_sectors)
            selected_sectors = [advisory_sectors[(start + offset) % len(advisory_sectors)] for offset in range(sector_count)]
            advisory.advisory_sectors.set(selected_sectors)

            image_count = 2 + (idx % 3)
            for image_index in range(image_count):
                image_bytes = self._generate_image_bytes(idx, image_index, advisory.title)
                AdvisoryServiceImage.objects.create(
                    advisory_service=advisory,
                    image=ContentFile(image_bytes, name=f"sample_advisory_{code}_{image_index + 1}.png"),
                    sort_order=image_index,
                )

        self.stdout.write(self.style.SUCCESS(f"Created {count} advisory sample records with images."))

    def _generate_image_bytes(self, idx: int, image_index: int, title: str) -> bytes:
        width, height = 1200, 720
        hue = (idx * 29 + image_index * 17) % 360
        bg = self._hsv_to_rgb(hue, 0.38, 0.96)
        accent = self._hsv_to_rgb((hue + 110) % 360, 0.72, 0.7)

        img = Image.new("RGB", (width, height), bg)
        draw = ImageDraw.Draw(img)

        draw.rounded_rectangle((60, 60, width - 60, height - 60), radius=36, outline=accent, width=6)
        draw.rectangle((90, 110, width - 90, 220), fill=(255, 255, 255))
        draw.rectangle((90, 260, width - 280, height - 110), fill=(255, 255, 255, 220))

        draw.text((120, 145), title[:54], fill=(35, 44, 57))
        draw.text((120, 305), f"Service image #{image_index + 1}", fill=accent)
        draw.text((120, 355), "Digit Advisory Sample", fill=(70, 74, 82))

        for stripe in range(5):
            offset = 120 + stripe * 36
            draw.line((width - 230, offset, width - 120, offset + 80), fill=accent, width=8)

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
