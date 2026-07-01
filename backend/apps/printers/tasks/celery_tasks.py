from celery import shared_task
from backend.services.pricing.service import PricingService
from backend.services.printing.service import PrintingService


@shared_task(name='printer.analyze_stl')
def analyze_stl_task(file_path: str):
    """Анализ STL файла"""
    service = PricingService()
    return service.analyze_stl(file_path)


@shared_task(name='printer.calculate_price')
def calculate_price_task(volume_cm3: float, material: str, fill_percentage: int):
    """Расчёт стоимости печати"""
    service = PricingService()
    return service.calculate(
        volume_cm3=volume_cm3,
        material=material,
        fill_percentage=fill_percentage
    )


@shared_task(name='printer.prepare_gcode')
def prepare_gcode_task(stl_path: str):
    """Подготовка G-code для печати"""
    service = PrintingService()
    return service.prepare_gcode(stl_path)


@shared_task(name='printer.send_to_printer')
def send_to_printer_task(gcode_path: str, job_name: str):
    """Отправка задания на печать"""
    service = PrintingService()
    return service.send_to_printer(gcode_path, job_name)
