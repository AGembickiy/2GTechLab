from typing import List, Optional
from django.db.models import Q, QuerySet
from backend.apps.warehouse.models import InventoryAudit, InventoryAuditItem


class AuditRepository:
    """Репозиторий для работы с инвентаризацией."""
    
    @staticmethod
    def get_all_audits() -> QuerySet[InventoryAudit]:
        return InventoryAudit.objects.select_related('created_by').all()
    
    @staticmethod
    def get_audit_by_id(audit_id: int) -> Optional[InventoryAudit]:
        return InventoryAudit.objects.filter(pk=audit_id).first()
    
    @staticmethod
    def get_audits_by_status(status: str) -> QuerySet[InventoryAudit]:
        return InventoryAudit.objects.filter(status=status)
    
    @staticmethod
    def get_current_audits() -> QuerySet[InventoryAudit]:
        return InventoryAudit.objects.filter(status__in=[InventoryAudit.STATUS_PLANNED, InventoryAudit.STATUS_IN_PROGRESS])
    
    @staticmethod
    def create_audit(
        title: str,
        description: str,
        planned_date,
        created_by=None
    ) -> InventoryAudit:
        return InventoryAudit.objects.create(
            title=title,
            description=description,
            planned_date=planned_date,
            created_by=created_by
        )
    
    @staticmethod
    def update_audit(audit: InventoryAudit, **kwargs) -> InventoryAudit:
        for key, value in kwargs.items():
            setattr(audit, key, value)
        audit.save()
        return audit
    
    @staticmethod
    def get_audit_items(audit_id: int) -> QuerySet[InventoryAuditItem]:
        return InventoryAuditItem.objects.filter(audit_id=audit_id).select_related('warehouse_item')
    
    @staticmethod
    def get_audit_item(audit_id: int, item_id: int) -> Optional[InventoryAuditItem]:
        return InventoryAuditItem.objects.filter(audit_id=audit_id, warehouse_item_id=item_id).first()
    
    @staticmethod
    def create_audit_item(
        audit,
        warehouse_item,
        system_quantity: int,
        actual_quantity: int = 0,
        notes: str = ''
    ) -> InventoryAuditItem:
        return InventoryAuditItem.objects.create(
            audit=audit,
            warehouse_item=warehouse_item,
            system_quantity=system_quantity,
            actual_quantity=actual_quantity,
            notes=notes
        )
    
    @staticmethod
    def verify_audit_item(
        audit_item: InventoryAuditItem,
        verified_by=None
    ) -> InventoryAuditItem:
        audit_item.verified = True
        audit_item.verified_by = verified_by
        audit_item.save()
        return audit_item
