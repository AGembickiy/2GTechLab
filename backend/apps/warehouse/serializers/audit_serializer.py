from rest_framework import serializers
from backend.apps.warehouse.models import InventoryAudit, InventoryAuditItem, WarehouseItem


class InventoryAuditItemSerializer(serializers.ModelSerializer):
    """Сериализатор для элементов инвентаризации."""
    warehouse_item_id = serializers.PrimaryKeyRelatedField(
        source='warehouse_item',
        queryset=WarehouseItem.objects.all(),
        write_only=True
    )
    warehouse_item_name = serializers.CharField(source='warehouse_item.name', read_only=True)
    warehouse_item_sku = serializers.CharField(source='warehouse_item.sku', read_only=True)
    
    class Meta:
        model = InventoryAuditItem
        fields = [
            'id', 'warehouse_item_id', 'warehouse_item_name', 'warehouse_item_sku',
            'system_quantity', 'actual_quantity', 'difference', 'notes', 'verified',
            'verified_by', 'verified_at'
        ]
        read_only_fields = ['difference', 'verified', 'verified_by', 'verified_at']


class InventoryAuditSerializer(serializers.ModelSerializer):
    """Сериализатор для инвентаризации."""
    items = InventoryAuditItemSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    audit_items = InventoryAuditItemSerializer(many=True, write_only=True, required=False)
    
    class Meta:
        model = InventoryAudit
        fields = [
            'id', 'title', 'description', 'status', 'planned_date',
            'completed_at', 'created_by', 'created_by_username',
            'items', 'audit_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'completed_at', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        audit_items_data = validated_data.pop('audit_items', [])
        audit = InventoryAudit.objects.create(**validated_data)
        
        for item_data in audit_items_data:
            InventoryAuditItem.objects.create(audit=audit, **item_data)
        
        return audit
