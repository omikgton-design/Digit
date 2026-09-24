from __future__ import annotations

from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db.models import Case, IntegerField, When
from PIL import Image, ImageDraw

from website.models import Customer


class Command(BaseCommand):
    help = "Generate simple black partner logos for paid organization customers without logos."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=10)

    def handle(self, *args, **options):
        count = max(1, options["count"])
        customers = (
            Customer.objects
            .filter(account_type=Customer.ACCOUNT_ORG, type__in=[Customer.TYPE_GOLD, Customer.TYPE_SILVER])
            .annotate(
                paid_rank=Case(
                    When(type=Customer.TYPE_GOLD, then=2),
                    When(type=Customer.TYPE_SILVER, then=1),
                    default=0,
                    output_field=IntegerField(),
                )
            )
            .order_by("-paid_rank", "-update_date", "-created_date", "-id")[:count]
        )

        updated = 0
        for customer in customers:
            if customer.logo:
                continue
            image_bytes = self._generate_logo(customer.name)
            customer.logo.save(f"partner_logo_{customer.id}.png", ContentFile(image_bytes), save=True)
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Generated partner logos: {updated}"))

    def _generate_logo(self, name: str) -> bytes:
        width, height = 420, 120
        img = Image.new("RGBA", (width, height), (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)
        initials = "".join(part[0] for part in name.replace("-", " ").split()[:3]).upper()[:3] or "D"
        draw.rounded_rectangle((20, 22, 104, 106), radius=18, fill=(0, 0, 0, 255))
        draw.text((47, 51), initials[:1], fill=(255, 255, 255, 255))
        draw.text((124, 46), initials, fill=(0, 0, 0, 255))
        draw.line((124, 78, 320, 78), fill=(0, 0, 0, 255), width=4)
        out = BytesIO()
        img.save(out, format="PNG", optimize=True)
        return out.getvalue()
