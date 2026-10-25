from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from website.models import AdvisoryService, Software


class Command(BaseCommand):
    help = "Delete all software/advisory records and create fresh sample catalog data."

    def add_arguments(self, parser):
        parser.add_argument("--software-count", type=int, default=50)
        parser.add_argument("--advisory-count", type=int, default=50)

    def handle(self, *args, **options):
        software_count = max(1, options["software_count"])
        advisory_count = max(1, options["advisory_count"])

        with transaction.atomic():
            deleted_softwares = Software.objects.count()
            deleted_advisories = AdvisoryService.objects.count()
            Software.objects.all().delete()
            AdvisoryService.objects.all().delete()

        self.stdout.write(self.style.WARNING(f"Deleted software records: {deleted_softwares}"))
        self.stdout.write(self.style.WARNING(f"Deleted advisory records: {deleted_advisories}"))

        call_command("seed_software_samples", count=software_count)
        call_command("seed_advisory_samples", count=advisory_count)

        self.stdout.write(self.style.SUCCESS("Catalog sample reset complete."))
