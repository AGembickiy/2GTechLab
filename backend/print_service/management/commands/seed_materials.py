from decimal import Decimal

from django.core.management.base import BaseCommand

from print_service.models import MaterialPreset


class Command(BaseCommand):
    help = "Создаёт тестовые MaterialPreset, если таблица пуста"

    def handle(self, *args, **options):
        if MaterialPreset.objects.exists():
            self.stdout.write(self.style.WARNING("MaterialPreset уже есть — пропуск."))
            return

        rows = [
            ("PLA Белый", "PLA", "#ffffff", 1.24, Decimal("800.00")),
            ("PLA Чёрный", "PLA", "#111827", 1.24, Decimal("800.00")),
            ("PETG Серый", "PETG", "#9ca3af", 1.27, Decimal("900.00")),
            ("ABS Custom", "ABS", "#8b5cf6", 1.04, Decimal("950.00")),
        ]
        for name, typ, hx, dens, price in rows:
            MaterialPreset.objects.create(
                name=name,
                type=typ,
                color_hex=hx,
                density_g_per_cm3=dens,
                price_per_kg=price,
            )
        self.stdout.write(self.style.SUCCESS(f"Создано {len(rows)} пресетов."))
