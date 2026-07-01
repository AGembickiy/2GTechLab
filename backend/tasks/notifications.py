"""
Celery tasks for notifications.
"""
from celery import shared_task


@shared_task
def send_order_status_notification(order_id: int, status: str):
    """Отправить уведомление об изменении статуса заказа."""
    # Здесь будет логика отправки уведомлений
    return {
        "status": "success",
        "order_id": order_id,
        "status": status,
        "message": "Notification sent"
    }


@shared_task
def send_low_stock_notification(item_id: int, quantity: float, threshold: float):
    """Отправить уведомление о низком остатке."""
    return {
        "status": "success",
        "item_id": item_id,
        "quantity": quantity,
        "threshold": threshold,
        "message": "Low stock notification sent"
    }


@shared_task
def send_printer_maintenance_notification(printer_id: int, hours: float):
    """Отправить уведомление о необходимости ТО принтера."""
    return {
        "status": "success",
        "printer_id": printer_id,
        "hours": hours,
        "message": "Maintenance notification sent"
    }