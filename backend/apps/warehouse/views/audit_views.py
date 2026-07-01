from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.apps.warehouse.models import InventoryAudit, InventoryAuditItem
from backend.apps.warehouse.serializers.audit_serializer import (
    InventoryAuditSerializer,
    InventoryAuditItemSerializer
)


class InventoryAuditListView(APIView):
    """Представление для списка инвентаризаций."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Получить список инвентаризаций."""
        audits = InventoryAudit.objects.select_related('created_by').all()
        serializer = InventoryAuditSerializer(audits, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Создать новую инвентаризацию."""
        serializer = InventoryAuditSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryAuditDetailView(APIView):
    """Представление для одной инвентаризации."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Получить инвентаризацию по ID."""
        try:
            audit = InventoryAudit.objects.select_related('created_by').get(pk=pk)
            serializer = InventoryAuditSerializer(audit)
            return Response(serializer.data)
        except InventoryAudit.DoesNotExist:
            return Response(
                {'error': 'Инвентаризация не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, pk):
        """Обновить инвентаризацию."""
        try:
            audit = InventoryAudit.objects.get(pk=pk)
        except InventoryAudit.DoesNotExist:
            return Response(
                {'error': 'Инвентаризация не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = InventoryAuditSerializer(audit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Удалить инвентаризацию."""
        try:
            audit = InventoryAudit.objects.get(pk=pk)
        except InventoryAudit.DoesNotExist:
            return Response(
                {'error': 'Инвентаризация не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        audit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InventoryAuditItemListView(APIView):
    """Представление для элементов инвентаризации."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, audit_id):
        """Получить элементы инвентаризации."""
        try:
            audit = InventoryAudit.objects.get(pk=audit_id)
            items = InventoryAuditItem.objects.filter(audit=audit).select_related('warehouse_item')
            serializer = InventoryAuditItemSerializer(items, many=True)
            return Response(serializer.data)
        except InventoryAudit.DoesNotExist:
            return Response(
                {'error': 'Инвентаризация не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, audit_id):
        """Добавить элемент инвентаризации."""
        try:
            audit = InventoryAudit.objects.get(pk=audit_id)
        except InventoryAudit.DoesNotExist:
            return Response(
                {'error': 'Инвентаризация не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = InventoryAuditItemSerializer(
            data={**request.data, 'audit': audit_id}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryAuditItemDetailView(APIView):
    """Представление для одного элемента инвентаризации."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, audit_id, item_id):
        """Получить элемент инвентаризации."""
        try:
            audit = InventoryAudit.objects.get(pk=audit_id)
            item = InventoryAuditItem.objects.get(audit=audit, warehouse_item_id=item_id)
            serializer = InventoryAuditItemSerializer(item)
            return Response(serializer.data)
        except InventoryAuditItem.DoesNotExist:
            return Response(
                {'error': 'Элемент инвентаризации не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, audit_id, item_id):
        """Обновить элемент инвентаризации."""
        try:
            audit = InventoryAudit.objects.get(pk=audit_id)
            item = InventoryAuditItem.objects.get(audit=audit, warehouse_item_id=item_id)
        except InventoryAuditItem.DoesNotExist:
            return Response(
                {'error': 'Элемент инвентаризации не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = InventoryAuditItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, audit_id, item_id):
        """Удалить элемент инвентаризации."""
        try:
            audit = InventoryAudit.objects.get(pk=audit_id)
            item = InventoryAuditItem.objects.get(audit=audit, warehouse_item_id=item_id)
        except InventoryAuditItem.DoesNotExist:
            return Response(
                {'error': 'Элемент инвентаризации не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VerifyAuditItemView(APIView):
    """Представление для верификации элемента инвентаризации."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, audit_id, item_id):
        """Подтвердить элемент инвентаризации."""
        try:
            audit = InventoryAudit.objects.get(pk=audit_id)
            item = InventoryAuditItem.objects.get(audit=audit, warehouse_item_id=item_id)
        except InventoryAuditItem.DoesNotExist:
            return Response(
                {'error': 'Элемент инвентаризации не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        from backend.apps.warehouse.repositories.audit_repository import AuditRepository
        audit_repo = AuditRepository()
        audit_repo.verify_audit_item(item, request.user)
        
        return Response({'success': True, 'verified': True})
