from backend.repositories.printers.printer_repository import PrinterRepository
from backend.apps.printers.models import Printer, PrinterStatus


class PrinterAssignmentService:
    """Сервис автоматического назначения принтеров для заказов."""

    @staticmethod
    def find_available_printer() -> Printer:
        """
        Найти доступный принтер для назначения.
        Приоритет отдает менее отработавшим принтерам.
        """
        idle_printers = PrinterRepository.get_idle_printers()

        if not idle_printers.exists():
            return None

        # Выбираем принтер с наименьшим количеством отработанных часов
        return idle_printers.order_by('working_hours').first()

    @staticmethod
    def find_printer_by_build_volume(
        min_x: float,
        min_y: float,
        min_z: float
    ) -> Printer:
        """Найти принтер с достаточным объемом рабочей зоны."""
        printers = PrinterRepository.get_by_build_volume(min_x, min_y, min_z)
        idle_printers = printers.filter(status=PrinterStatus.IDLE)

        if not idle_printers.exists():
            return None

        return idle_printers.order_by('working_hours').first()

    @staticmethod
    def find_compatible_printer(
        material_type: str,
        min_x: float = 0,
        min_y: float = 0,
        min_z: float = 0
    ) -> Printer:
        """Найти принтер, совместимый с материалом и размерами."""
        # TODO: добавить логику проверки совместимости материалов
        return PrinterAssignmentService.find_printer_by_build_volume(min_x, min_y, min_z)
