from typing import List, Optional
from django.db.models import Q, QuerySet
from django.contrib.auth.models import User
from backend.apps.warehouse.models import WarehouseItem, WarehouseTransaction


class WarehouseRepository:
    """Репозиторий для работы со складскими товарами."""
    
    @staticmethod
    def get_all_items() -> QuerySet[WarehouseItem]:
        return WarehouseItem.objects.select_related().all()
    
    @staticmethod
    def get_item_by_id(item_id: int) -> Optional[WarehouseItem]:
        return WarehouseItem.objects.filter(pk=item_id).first()
    
    @staticmethod
    def get_item_by_sku(sku: str) -> Optional[WarehouseItem]:
        return WarehouseItem.objects.filter(sku=sku).first()
    
    @staticmethod
    def get_items_by_type(item_type: str) -> QuerySet[WarehouseItem]:
        return WarehouseItem.objects.filter(item_type=item_type, is_active=True)
    
    @staticmethod
    def get_low_stock_items() -> QuerySet[WarehouseItem]:
        return WarehouseItem.objects.filter(quantity__lte=F('min_quantity'), is_active=True)
    
    @staticmethod
    def get_out_of_stock_items() -> QuerySet[WarehouseItem]:
        return WarehouseItem.objects.filter(quantity=0, is_active=True)
    
    @staticmethod
    def search_items(query: str) -> QuerySet[WarehouseItem]:
        return WarehouseItem.objects.filter(
            Q(name__icontains=query) |
            Q(sku__icontains=query) |
            Q(description__icontains=query)
        )
    
    @staticmethod
    def create_item(
        name: str,
        description: str,
        item_type: str,
        sku: str,
        quantity: int,
        min_quantity: int,
        unit: str,
        cost_price: float,
        selling_price: float,
        supplier: str = '',
        location: str = ''
    ) -> WarehouseItem:
        return WarehouseItem.objects.create(
            name=name,
            description=description,
            item_type=item_type,
            sku=sku,
            quantity=quantity,
            min_quantity=min_quantity,
            unit=unit,
            cost_price=cost_price,
            selling_price=selling_price,
            supplier=supplier,
            location=location
        )
    
    @staticmethod
    def update_item(item: WarehouseItem, **kwargs) -> WarehouseItem:
        for key, value in kwargs.items():
            setattr(item, key, value)
        item.save()
        return item
    
    @staticmethod
    def delete_item(item: WarehouseItem) -> None:
        item.delete()
    
    @staticmethod
    def adjust_stock(item: WarehouseItem, quantity_change: int, description: str = '') -> WarehouseTransaction:
        """Корректировка количества на складе."""
        old_quantity = item.quantity
        new_quantity = old_quantity + quantity_change
        
        if new_quantity < 0:
            raise ValueError("Недостаточно товара на складе")
        
        item.quantity = new_quantity
        item.save()
        
        return WarehouseTransaction.objects.create(
            item=item,
            transaction_type=WarehouseTransaction.TRANSACTION_TYPE_ADJUSTMENT,
            quantity=abs(quantity_change),
            old_quantity=old_quantity,
            new_quantity=new_quantity,
            description=description
        )
