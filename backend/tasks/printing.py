"""
Celery tasks for printing.
"""
from celery import shared_task
from backend.repositories.printers.printer_repository import PrinterRepository
from backend.services.printing.printer_assignment_service import PrinterAssignmentService


@shared_task
def assign_printer_to_orders():
    """Назначить принтеры для всех заказов в статусе accepted."""
    from backend.repositories.orders.order_repository import OrderRepository
    from backend.apps.orders.models import OrderStatus

    orders = OrderRepository.get_by_status(OrderStatus.ACCEPTED).filter(printer__isnull=True)

    assigned = 0
    for order in orders:
        printer = PrinterAssignmentService.find_available_printer()
        if printer:
            order.printer = printer
            order.save()
            assigned += 1

    return {"status": "success", "assigned_orders": assigned}


@shared_task
def update_printer_status(printer_id: int, status: str):
    """Обновить статус принтера."""
    printer = PrinterRepository.get_by_id(printer_id)
    if not printer:
        return {"status": "error", "message": "Printer not found"}

    PrinterRepository.update_status(printer, status)

    return {"status": "success", "printer_id": printer_id, "new_status": status}


@shared_task
def calculate_printer_utilization():
    """Рассчитать利用率 принтеров."""
    printers = PrinterRepository.get_all()

    utilization_data = []
    for printer in printers:
        total_orders = printer.orders.count()
        completed_orders = printer.orders.filter(status='completed').count()

        utilization = (completed_orders / total_orders * 100) if total_orders > 0 else 0

        utilization_data.append({
            "printer_id": printer.id,
            "name": printer.name,
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "utilization_percent": round(utilization, 2)
        })

    return {"status": "success", "data": utilization_data}