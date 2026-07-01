from rest_framework import serializers
from backend.apps.warehouse.models import WarehouseItem


class WarehouseItemSerializer(serializers.ModelSerializer):
    """Сериализатор для элементов склада."""
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = WarehouseItem
        fields = [
            'id', 'name', 'description', 'item_type', 'sku', 'quantity',
            'min_quantity', 'unit', 'cost_price', 'selling_price',
            'supplier', 'location', 'is_active', 'is_low_stock',
            'is_out_of_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_sku(self, value):
        if WarehouseItem.objects.filter(sku=value).exists():
            raise serializers.ValidationError("Товар с таким артикулом уже существует")
        return value
    
    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Количество не может быть отрицательным")
        return value
