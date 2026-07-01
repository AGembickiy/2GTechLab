from django.contrib import admin
from backend.apps.warehouse.models import WarehouseItem, WarehouseTransaction, InventoryAudit, InventoryAuditItem


@admin.register(WarehouseItem)
class WarehouseItemAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'item_type', 'quantity', 'min_quantity', 'is_low_stock', 'is_out_of_stock', 'location', 'is_active']
    list_filter = ['item_type', 'is_active']
    search_fields = ['sku', 'name', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Общая информация', {
            'fields': ('name', 'description', 'sku', 'item_type')
        }),
        ('Складские данные', {
            'fields': ('quantity', 'min_quantity', 'unit', 'location')
        }),
        ('Цены', {
            'fields': ('cost_price', 'selling_price')
        }),
        ('Поставщик', {
            'fields': ('supplier',)
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
    )


@admin.register(WarehouseTransaction)
class WarehouseTransactionAdmin(admin.ModelAdmin):
    list_display = ['item', 'transaction_type', 'quantity', 'old_quantity', 'new_quantity', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['item__name', 'item__sku', 'description']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(InventoryAudit)
class InventoryAuditAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'planned_date', 'completed_at', 'created_at']
    list_filter = ['status', 'planned_date', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'planned_date'


@admin.register(InventoryAuditItem)
class InventoryAuditItemAdmin(admin.ModelAdmin):
    list_display = ['audit', 'warehouse_item', 'system_quantity', 'actual_quantity', 'difference', 'verified']
    list_filter = ['verified', 'audit']
    search_fields = ['warehouse_item__name', 'warehouse_item__sku', 'notes']
    readonly_fields = ['difference', 'verified', 'verified_at']
    fieldsets = (
        ('Инвентаризация', {
            'fields': ('audit', 'warehouse_item')
        }),
        ('Количество', {
            'fields': ('system_quantity', 'actual_quantity', 'difference')
        }),
        ('Примечания', {
            'fields': ('notes', 'verified', 'verified_by', 'verified_at')
        }),
    )
