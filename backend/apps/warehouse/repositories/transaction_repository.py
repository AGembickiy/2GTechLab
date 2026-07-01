from typing import List, Optional
from django.db.models import Q, QuerySet
from backend.apps.warehouse.models import WarehouseTransaction


class WarehouseTransactionRepository:
    """Репозиторий для работы с транзакциями склада."""
    
    @staticmethod
    def get_all_transactions() -> QuerySet[WarehouseTransaction]:
        return WarehouseTransaction.objects.select_related('item', 'created_by', 'related_order').all()
    
    @staticmethod
    def get_transaction_by_id(transaction_id: int) -> Optional[WarehouseTransaction]:
        return WarehouseTransaction.objects.filter(pk=transaction_id).first()
    
    @staticmethod
    def get_transactions_by_item(item_id: int) -> QuerySet[WarehouseTransaction]:
        return WarehouseTransaction.objects.filter(item_id=item_id).select_related('item')
    
    @staticmethod
    def get_transactions_by_type(transaction_type: str) -> QuerySet[WarehouseTransaction]:
        return WarehouseTransaction.objects.filter(transaction_type=transaction_type)
    
    @staticmethod
    def get_transactions_by_date_range(start_date, end_date) -> QuerySet[WarehouseTransaction]:
        return WarehouseTransaction.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
    
    @staticmethod
    def create_transaction(
        item,
        transaction_type: str,
        quantity: int,
        old_quantity: int,
        new_quantity: int,
        description: str = '',
        related_order=None,
        created_by=None
    ) -> WarehouseTransaction:
        return WarehouseTransaction.objects.create(
            item=item,
            transaction_type=transaction_type,
            quantity=quantity,
            old_quantity=old_quantity,
            new_quantity=new_quantity,
            description=description,
            related_order=related_order,
            created_by=created_by
        )
