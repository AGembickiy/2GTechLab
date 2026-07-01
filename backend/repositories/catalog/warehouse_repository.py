from typing import List, Optional
from django.db.models import QuerySet, models
from backend.apps.catalog.models.warehouse import WarehouseItem, WarehouseItemCategory


class WarehouseRepository:
    """Репозиторий для работы со складом."""

    @staticmethod
    def get_by_id(item_id: int) -> Optional[WarehouseItem]:
        """Получить складской товар по ID."""
        try:
            return WarehouseItem.objects.get(pk=item_id)
        except WarehouseItem.DoesNotExist:
            return None

    @staticmethod
    def get_all() -> QuerySet[WarehouseItem]:
        """Получить все складские товары."""
        return WarehouseItem.objects.all()

    @staticmethod
    def get_by_category(category: str) -> QuerySet[WarehouseItem]:
        """Получить товары по категории."""
        return WarehouseItem.objects.filter(category=category)

    @staticmethod
    def get_low_stock() -> QuerySet[WarehouseItem]:
        """Получить товары с низким остатком."""
        return WarehouseItem.objects.filter(quantity_in_stock__lte=models.F('min_threshold'))

    @staticmethod
    def get_by_name(name: str) -> QuerySet[WarehouseItem]:
        """Получить товары по названию (частичный поиск)."""
        return WarehouseItem.objects.filter(name__icontains=name)

    @staticmethod
    def update_stock(item: WarehouseItem, amount: float) -> WarehouseItem:
        """Обновить количество товара на складе."""
        item.quantity_in_stock += amount
        item.save()
        return item

    @staticmethod
    def check_availability(item_id: int, quantity: float) -> bool:
        """Проверить доступность товара."""
        item = WarehouseRepository.get_by_id(item_id)
        if not item:
            return False
        return item.quantity_in_stock >= quantity
