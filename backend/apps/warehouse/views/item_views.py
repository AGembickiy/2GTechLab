from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from backend.apps.warehouse.models import WarehouseItem, WarehouseTransaction
from backend.apps.warehouse.serializers.item_serializer import WarehouseItemSerializer
from backend.apps.warehouse.serializers.transaction_serializer import WarehouseTransactionSerializer
from backend.apps.warehouse.services.warehouse_service import WarehouseService
from backend.core.pagination.pagination import StandardPagination
from backend.core.throttling.throttling import BurstRateThrottle
from django.db.models import F


class WarehouseItemListView(ListCreateAPIView):
    """Представление для списка элементов склада."""
    queryset = WarehouseItem.objects.all()
    serializer_class = WarehouseItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['item_type', 'is_active']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'
    
    def get_queryset(self):
        queryset = WarehouseItem.objects.all()
        item_type = self.request.query_params.get('item_type')
        
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        
        if self.request.query_params.get('low_stock'):
            queryset = queryset.filter(quantity__lte=F('min_quantity'))
        
        if self.request.query_params.get('out_of_stock'):
            queryset = queryset.filter(quantity=0)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()


class WarehouseItemDetailView(RetrieveUpdateDestroyAPIView):
    """Представление для одного элемента склада."""
    queryset = WarehouseItem.objects.all()
    serializer_class = WarehouseItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'


class WarehouseStockView(APIView):
    """Представление для управления остатками."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'burst'
    
    def __init__(self):
        super().__init__()
        self.service = WarehouseService()
    
    def post(self, request):
        """Корректировка остатка."""
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        description = request.data.get('description', '')
        
        if not item_id or quantity is None:
            return Response(
                {'error': 'Требуется item_id и quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = self.service.add_stock(item_id, quantity, description)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WarehouseLowStockView(APIView):
    """Представление для товаров с низким запасом."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'
    
    def __init__(self):
        super().__init__()
        self.service = WarehouseService()
    
    def get(self, request):
        """Получить товары с низким запасом."""
        items = self.service.get_low_stock_items()
        return Response(items, status=status.HTTP_200_OK)


class WarehouseOutofStockView(APIView):
    """Представление для отсутствующих товаров."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'
    
    def __init__(self):
        super().__init__()
        self.service = WarehouseService()
    
    def get(self, request):
        """Получить отсутствующие товары."""
        items = self.service.get_out_of_stock_items()
        return Response(items, status=status.HTTP_200_OK)
