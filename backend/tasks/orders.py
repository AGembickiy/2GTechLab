"""
Celery tasks for orders.
"""
from celery import shared_task
from backend.repositories.orders.order_repository import OrderRepository
from backend.services.orders.order_service import OrderService
from backend.services.warehouse.warehouse_service import WarehouseService
from backend.services.printing.printer_assignment_service import PrinterAssignmentService


@shared_task
def process_order(order_id: int):
    """Обработка нового заказа."""
    order = OrderRepository.get_by_id(order_id)
    if not order:
        return {"status": "error", "message": "Order not found"}

    service = OrderService()
    service.accept_order(order)

    return {"status": "success", "order_id": order_id}


@shared_task
def start_order_printing(order_id: int):
    """Начать печать заказа."""
    order = OrderRepository.get_by_id(order_id)
    if not order:
        return {"status": "error", "message": "Order not found"}

    service = OrderService()
    service.start_printing(order)

    return {"status": "success", "order_id": order_id}


@shared_task
def complete_order(order_id: int):
    """Завершить заказ."""
    order = OrderRepository.get_by_id(order_id)
    if not order:
        return {"status": "error", "message": "Order not found"}

    service = OrderService()
    service.complete_order(order)

    # Списание материала
    WarehouseService.deduct(order)

    return {"status": "success", "order_id": order_id}


@shared_task
def cancel_order(order_id: int):
    """Отменить заказ и вернуть материал на склад."""
    order = OrderRepository.get_by_id(order_id)
    if not order:
        return {"status": "error", "message": "Order not found"}

    service = OrderService()
    service.cancel_order(order)

    # Возврат материала на склад
    WarehouseService.return_to_stock(order)

    return {"status": "success", "order_id": order_id}


@shared_task
def assign_printer_to_order(order_id: int):
    """Назначить принтер для заказа."""
    order = OrderRepository.get_by_id(order_id)
    if not order:
        return {"status": "error", "message": "Order not found"}

    printer = PrinterAssignmentService.find_available_printer()
    if printer:
        order.printer = printer
        order.save()
        return {"status": "success", "printer_id": printer.id}

    return {"status": "error", "message": "No available printers"}