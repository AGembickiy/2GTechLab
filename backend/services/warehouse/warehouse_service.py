from backend.repositories.catalog.warehouse_repository import WarehouseRepository
from backend.apps.catalog.models.warehouse import WarehouseItem


class WarehouseService:
    """Сервис управления складом."""

    @staticmethod
    def get_all_items() -> list:
        """Получить все складские товары."""
        return list(WarehouseRepository.get_all())

    @staticmethod
    def get_by_category(category: str) -> list:
        """Получить товары по категории."""
        return list(WarehouseRepository.get_by_category(category))

    @staticmethod
    def get_low_stock_items() -> list:
        """Получить товары с низким остатком."""
        return list(WarehouseRepository.get_low_stock())

    @staticmethod
    def get_by_id(item_id: int) -> WarehouseItem:
        """Получить товар по ID."""
        return WarehouseRepository.get_by_id(item_id)

    @staticmethod
    def check_availability(item_id: int, quantity: float) -> bool:
        """Проверить доступность товара."""
        return WarehouseRepository.check_availability(item_id, quantity)

    @staticmethod
    def reserve(item: WarehouseItem, quantity: float) -> None:
        """Резервировать материал."""
        from django.core.exceptions import ValidationError

        if item.quantity_in_stock < quantity:
            raise ValidationError("Not enough material in stock")

        WarehouseRepository.update_stock(item, -quantity)

    @staticmethod
    def return_to_stock(item: WarehouseItem, quantity: float) -> None:
        """Вернуть материал на склад."""
        WarehouseRepository.update_stock(item, quantity)

    @staticmethod
    def update_stock(item: WarehouseItem, amount: float) -> WarehouseItem:
        """Обновить количество товара."""
        return WarehouseRepository.update_stock(item, amount)

    @staticmethod
    def get_stock_alerts() -> dict:
        """Получить предупреждения о складе."""
        low_stock = WarehouseRepository.get_low_stock()
        return {
            "count": low_stock.count(),
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "current_stock": item.quantity_in_stock,
                    "min_threshold": item.min_threshold,
                    "needs_reorder": item.is_low_stock
                }
                for item in low_stock
            ]
        }
