from typing import List, Optional
from django.db.models import QuerySet
from backend.apps.printers.models import Printer, PrinterStatus


class PrinterRepository:
    """Репозиторий для работы с принтерами."""

    @staticmethod
    def get_by_id(printer_id: int) -> Optional[Printer]:
        """Получить принтер по ID."""
        try:
            return Printer.objects.get(pk=printer_id)
        except Printer.DoesNotExist:
            return None

    @staticmethod
    def get_all() -> QuerySet[Printer]:
        """Получить все принтеры."""
        return Printer.objects.all()

    @staticmethod
    def get_by_status(status: str) -> QuerySet[Printer]:
        """Получить принтеры по статусу."""
        return Printer.objects.filter(status=status)

    @staticmethod
    def get_idle_printers() -> QuerySet[Printer]:
        """Получить свободные принтеры."""
        return Printer.objects.filter(status=PrinterStatus.IDLE)

    @staticmethod
    def get_by_build_volume(
        min_x: float = None,
        min_y: float = None,
        min_z: float = None
    ) -> QuerySet[Printer]:
        """Получить принтеры с достаточным объемом рабочей зоны."""
        query = Printer.objects.all()
        if min_x:
            query = query.filter(bed_size_x__gte=min_x)
        if min_y:
            query = query.filter(bed_size_y__gte=min_y)
        if min_z:
            query = query.filter(bed_size_z__gte=min_z)
        return query

    @staticmethod
    def update_status(printer: Printer, new_status: str) -> Printer:
        """Обновить статус принтера."""
        printer.status = new_status
        printer.save()
        return printer

    @staticmethod
    def update_working_hours(printer: Printer, hours: float) -> Printer:
        """Обновить отработанные часы принтера."""
        printer.working_hours += hours
        printer.save()
        return printer
