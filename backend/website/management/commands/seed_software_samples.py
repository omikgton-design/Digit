from __future__ import annotations

import random
from decimal import Decimal
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from website.models import Category, Customer, Software, SoftwareImage


class Command(BaseCommand):
    help = "Seed 50 software sample records with unique values and images"

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

        program_names = [
            "ERP",
            "CRM",
            "POS",
            "HRM",
            "Accounting",
            "Inventory",
            "E-Commerce",
            "Project Management",
        ]
        advisory_names = [
            "Finance",
            "Retail",
            "Education",
            "Healthcare",
            "Construction",
            "Agriculture",
            "Logistics",
            "Manufacturing",
        ]

        program_categories = [
            Category.objects.get_or_create(name=name, type=Category.TYPE_PROGRAM)[0]
            for name in program_names
        ]
        advisory_categories = [
            Category.objects.get_or_create(name=name, type=Category.TYPE_ADVISORY)[0]
            for name in advisory_names
        ]

        developers = []
        for i in range(1, 11):
            dev_user, _ = User.objects.get_or_create(
                username=f"sampledev{i:02d}",
                defaults={"email": f"sampledev{i:02d}@example.com"},
            )
            customer, _ = Customer.objects.get_or_create(
                user=dev_user,
                defaults={
                    "name": f"Sample Developer {i:02d}",
                    "email": dev_user.email or f"sampledev{i:02d}@example.com",
                    "account_type": Customer.ACCOUNT_ORG,
                    "type": Customer.TYPE_BRONZE,
                },
            )
            developers.append(customer)

        if reset:
            sample_qs = Software.objects.filter(name__startswith="Sample Software ")
            deleted_count = sample_qs.count()
            sample_qs.delete()
            self.stdout.write(self.style.WARNING(f"Deleted old sample software: {deleted_count}"))

        adjectives = [
            "Smart",
            "Prime",
            "Nova",
            "Quantum",
            "Atlas",
            "Vertex",
            "Pulse",
            "Fusion",
            "Cloud",
            "Matrix",
        ]
        nouns = [
            "Suite",
            "Desk",
            "Flow",
            "Hub",
            "Core",
            "Works",
            "Stack",
            "One",
            "Bridge",
            "Pilot",
        ]

        for idx in range(1, count + 1):
            code = f"{idx:03d}"
            name = f"Sample Software {code} - {adjectives[idx % len(adjectives)]} {nouns[idx % len(nouns)]}"

            software = Software.objects.create(
                name=name,
                development_start_year=2016 + (idx % 10),
                program_type=program_categories[idx % len(program_categories)],
                developer=developers[idx % len(developers)],
                description=f"Sample description for software {code}.",
                introduction=f"Sample introduction for software {code}.",
                price=Decimal(str(49 + idx * 7)),
                price_type=Software.PRICE_TYPE_RENT if idx % 2 else Software.PRICE_TYPE_SALE,
                is_approved=True,
                is_featured=idx <= min(12, count),
                created_by=admin_user,
            )

            advisory_count = 2 + (idx % 2)
            start = idx % len(advisory_categories)
            selected = [advisory_categories[(start + off) % len(advisory_categories)] for off in range(advisory_count)]
            software.advisory_sectors.set(selected)

            image_bytes = self._generate_image_bytes(idx, software.name)
            SoftwareImage.objects.create(
                software=software,
                image=ContentFile(image_bytes, name=f"sample_software_{code}.png"),
                sort_order=0,
            )

        self.stdout.write(self.style.SUCCESS(f"Created {count} software sample records with images."))

    def _generate_image_bytes(self, idx: int, title: str) -> bytes:
        width, height = 1000, 600

        hue = (idx * 37) % 360
        bg = self._hsv_to_rgb(hue, 0.45, 0.92)
        accent = self._hsv_to_rgb((hue + 60) % 360, 0.68, 0.78)

        img = Image.new("RGB", (width, height), bg)
        draw = ImageDraw.Draw(img)

        for i in range(6):
            pad = 25 + i * 30
            color = (
                (accent[0] + i * 8) % 255,
                (accent[1] + i * 5) % 255,
                (accent[2] + i * 11) % 255,
            )
            draw.rectangle((pad, pad, width - pad, height - pad), outline=color, width=4)

        draw.rectangle((40, height - 120, width - 40, height - 40), fill=(255, 255, 255))
        short_title = title[:55]
        draw.text((60, height - 95), f"{short_title}", fill=(35, 44, 57))

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
