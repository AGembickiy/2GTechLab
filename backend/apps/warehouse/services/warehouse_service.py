from typing import Dict, List, Optional
from decimal import Decimal
from backend.apps.warehouse.repositories.warehouse_repository import WarehouseRepository
from backend.apps.warehouse.repositories.transaction_repository import WarehouseTransactionRepository


class WarehouseService:
    """Сервис для управления складом."""
    
    def __init__(self):
        self.warehouse_repo = WarehouseRepository()
        self.transaction_repo = WarehouseTransactionRepository()
    
    def get_all_items(self) -> List:
        """Получить все товары на складе."""
        return self.warehouse_repo.get_all_items()
    
    def get_item(self, item_id: int) -> Optional[Dict]:
        """Получить товар по ID."""
        item = self.warehouse_repo.get_item_by_id(item_id)
        if item:
            return {
                'id': item.id,
                'name': item.name,
                'sku': item.sku,
                'item_type': item.item_type,
                'quantity': item.quantity,
                'min_quantity': item.min_quantity,
                'cost_price': float(item.cost_price),
                'selling_price': float(item.selling_price),
                'is_low_stock': item.is_low_stock,
                'is_out_of_stock': item.is_out_of_stock,
                'location': item.location,
                'supplier': item.supplier,
                'created_at': item.created_at.isoformat() if item.created_at else None
            }
        return None
    
    def check_stock_availability(self, item_id: int, quantity: int) -> bool:
        """Проверить наличие товара на складе."""
        item = self.warehouse_repo.get_item_by_id(item_id)
        return item is not None and item.quantity >= quantity
    
    def reserve_stock(self, item_id: int, quantity: int, description: str = '') -> Optional[Dict]:
        """Забронировать товар на складе."""
        item = self.warehouse_repo.get_item_by_id(item_id)
        if not item or item.quantity < quantity:
            return {'success': False, 'error': 'Недостаточно товара на складе'}
        
        transaction = self.warehouse_repo.adjust_stock(
            item, -quantity, f"Бронирование: {description}"
        )
        return {
            'success': True,
            'transaction_id': transaction.id,
            'new_quantity': item.quantity
        }
    
    def release_stock(self, item_id: int, quantity: int, description: str = '') -> Optional[Dict]:
        """Освободить забронированный товар."""
        item = self.warehouse_repo.get_item_by_id(item_id)
        if not item:
            return {'success': False, 'error': 'Товар не найден'}
        
        transaction = self.warehouse_repo.adjust_stock(
            item, quantity, f"Освобождение резерва: {description}"
        )
        return {
            'success': True,
            'transaction_id': transaction.id,
            'new_quantity': item.quantity
        }
    
    def add_stock(self, item_id: int, quantity: int, description: str = '') -> Optional[Dict]:
        """Поступление товара на склад."""
        item = self.warehouse_repo.get_item_by_id(item_id)
        if not item:
            return {'success': False, 'error': 'Товар не найден'}
        
        transaction = self.warehouse_repo.adjust_stock(
            item, quantity, f"Поступление: {description}"
        )
        return {
            'success': True,
            'transaction_id': transaction.id,
            'new_quantity': item.quantity
        }
    
    def remove_stock(self, item_id: int, quantity: int, description: str = '') -> Optional[Dict]:
        """Списание товара со склада."""
        item = self.warehouse_repo.get_item_by_id(item_id)
        if not item:
            return {'success': False, 'error': 'Товар не найден'}
        
        if item.quantity < quantity:
            return {'success': False, 'error': 'Недостаточно товара на складе'}
        
        transaction = self.warehouse_repo.adjust_stock(
            item, -quantity, f"Списание: {description}"
        )
        return {
            'success': True,
            'transaction_id': transaction.id,
            'new_quantity': item.quantity
        }
    
    def get_low_stock_items(self) -> List[Dict]:
        """Получить товары с низким запасом."""
        items = self.warehouse_repo.get_low_stock_items()
        return [
            {
                'id': item.id,
                'name': item.name,
                'sku': item.sku,
                'quantity': item.quantity,
                'min_quantity': item.min_quantity,
                'is_low_stock': item.is_low_stock
            }
            for item in items
        ]
    
    def get_out_of_stock_items(self) -> List[Dict]:
        """Получить отсутствующие товары."""
        items = self.warehouse_repo.get_out_of_stock_items()
        return [
            {
                'id': item.id,
                'name': item.name,
                'sku': item.sku,
                'quantity': item.quantity
            }
            for item in items
        ]
    
    def search_items(self, query: str) -> List[Dict]:
        """Поиск товаров по запросу."""
        items = self.warehouse_repo.search_items(query)
        return [
            {
                'id': item.id,
                'name': item.name,
                'sku': item.sku,
                'item_type': item.item_type,
                'quantity': item.quantity,
                'cost_price': float(item.cost_price),
                'selling_price': float(item.selling_price),
                'location': item.location
            }
            for item in items
        ]
