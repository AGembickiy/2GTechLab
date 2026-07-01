"""
Celery tasks for warehouse.
"""
from celery import shared_task
from backend.repositories.catalog.warehouse_repository import WarehouseRepository
from backend.services.warehouse.warehouse_service import WarehouseService


@shared_task
def check_low_stock():
    """Проверить низкий остаток на складе и отправить уведомления."""
    low_stock_items = WarehouseRepository.get_low_stock()

    if not low_stock_items.exists():
        return {"status": "success", "message": "No low stock items"}

    return {
        "status": "success",
        "count": low_stock_items.count(),
        "items": [
            {"id": item.id, "name": item.name, "quantity": item.quantity_in_stock}
            for item in low_stock_items
        ]
    }


@shared_task
def update_stock(item_id: int, amount: float):
    """Обновить количество товара на складе."""
    item = WarehouseRepository.get_by_id(item_id)
    if not item:
        return {"status": "error", "message": "Item not found"}

    WarehouseRepository.update_stock(item, amount)

    return {"status": "success", "item_id": item_id, "new_quantity": item.quantity_in_stock}


@shared_task
def auto_reorder(item_id: int, quantity: float):
    """Автоматический заказ товара при низком остатке."""
    item = WarehouseRepository.get_by_id(item_id)
    if not item:
        return {"status": "error", "message": "Item not found"}

    if not item.is_low_stock:
        return {"status": "success", "message": "Stock level is adequate"}

    # Здесь можно добавить логику автоматического заказа
    return {
        "status": "success",
        "message": "Low stock alert",
        "item_id": item_id,
        "current_quantity": item.quantity_in_stock,
        "min_threshold": item.min_threshold
    }