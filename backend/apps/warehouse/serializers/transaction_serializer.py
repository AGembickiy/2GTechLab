from rest_framework import serializers
from backend.apps.warehouse.models import WarehouseTransaction


class WarehouseTransactionSerializer(serializers.ModelSerializer):
    """Сериализатор для транзакций склада."""
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = WarehouseTransaction
        fields = [
            'id', 'item', 'item_name', 'item_sku', 'transaction_type',
            'quantity', 'old_quantity', 'new_quantity', 'description',
            'related_order', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
