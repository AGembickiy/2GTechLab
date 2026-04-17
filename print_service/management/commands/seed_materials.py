from decimal import Decimal

from django.core.management.base import BaseCommand

from print_service.models import MaterialPreset


class Command(BaseCommand):
    help = "Создаёт или обновляет тестовые MaterialPreset (6 цветов)"

    def handle(self, *args, **options):
        rows = [
            ("PLA Синий", "PLA", "#3b82f6", 1.24, Decimal("820.00")),
            ("PLA Жёлтый", "PLA", "#f59e0b", 1.24, Decimal("820.00")),
            ("PLA Красный", "PLA", "#ef4444", 1.24, Decimal("820.00")),
            ("PLA Зелёный", "PLA", "#10b981", 1.24, Decimal("820.00")),
            ("PETG Прозрачный", "PETG", "#FFFFFF", 1.27, Decimal("1200.00")),
            ("TPU Чёрный", "TPU", "#000000", 1.20, Decimal("1800.00")),
            ("ABS Серый", "ABS", "#808080", 1.04, Decimal("1500.00")),
        ]
        created = 0
        updated = 0
        for name, typ, hx, dens, price in rows:
            obj, was_created = MaterialPreset.objects.update_or_create(
                name=name,
                defaults={
                    "type": typ,
                    "color_hex": hx,
                    "density_g_per_cm3": dens,
                    "price_per_kg": price,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: создано {created}, обновлено {updated}, всего эталонных пресетов {len(rows)}."
            )
        )
