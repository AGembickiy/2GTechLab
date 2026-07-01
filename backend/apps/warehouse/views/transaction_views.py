from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from backend.apps.warehouse.models import WarehouseTransaction
from backend.apps.warehouse.serializers.transaction_serializer import WarehouseTransactionSerializer
from backend.core.pagination.pagination import StandardPagination
from backend.core.throttling.throttling import BurstRateThrottle


class WarehouseTransactionListView(ListAPIView):
    """Представление для списка транзакций склада."""
    queryset = WarehouseTransaction.objects.select_related('item', 'created_by', 'related_order').all()
    serializer_class = WarehouseTransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['transaction_type', 'item']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'
    
    def get_queryset(self):
        queryset = WarehouseTransaction.objects.select_related('item', 'created_by', 'related_order').all()
        
        # Фильтрация по типу транзакции
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Фильтрация по товару
        item_id = self.request.query_params.get('item_id')
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        
        return queryset


class WarehouseTransactionDetailView(APIView):
    """Представление для одной транзакции склада."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'
    
    def get(self, request, pk):
        """Получить транзакцию по ID."""
        try:
            transaction = WarehouseTransaction.objects.select_related(
                'item', 'created_by', 'related_order'
            ).get(pk=pk)
            serializer = WarehouseTransactionSerializer(transaction)
            return Response(serializer.data)
        except WarehouseTransaction.DoesNotExist:
            return Response(
                {'error': 'Транзакция не найдена'},
                status=404
            )
