from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, Material, Printer
from .serializers import OrderSerializer, MaterialSerializer, PrinterSerializer, OrderParameterSerializer
from .tasks import process_order_task

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class PrinterViewSet(viewsets.ModelViewSet):
    queryset = Printer.objects.all()
    serializer_class = PrinterSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        order = serializer.save()
        process_order_task.delay(order.id)

    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        order = self.get_object()
        if 'parameters' in request.data:
            params_serializer = OrderParameterSerializer(
                order.parameters, data=request.data['parameters'], partial=True
            )
            if params_serializer.is_valid():
                params_serializer.save()
        
        process_order_task.delay(order.id)
        return Response({'status': 'reprocessing started'})

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        from django.db.models import Sum, Avg, Count
        data = {
            'total_revenue': Order.objects.filter(status='completed').aggregate(Sum('final_price'))['final_price__sum'] or 0,
            'orders_count': Order.objects.count(),
            'avg_check': Order.objects.filter(status='completed').aggregate(Avg('final_price'))['final_price__avg'] or 0,
            'popular_materials': Order.objects.values('material__name').annotate(count=Count('id')).order_by('-count')[:5]
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def finance(self, request):
        from django.db.models import Sum, Avg

        completed_orders = Order.objects.filter(status='completed')
        in_progress_orders = Order.objects.exclude(status__in=['completed', 'failed'])

        data = {
            'total_revenue': completed_orders.aggregate(Sum('final_price'))['final_price__sum'] or 0,
            'avg_check': completed_orders.aggregate(Avg('final_price'))['final_price__avg'] or 0,
            'completed_orders_count': completed_orders.count(),
            'in_progress_orders_count': in_progress_orders.count(),
            'estimated_pipeline_value': in_progress_orders.aggregate(Sum('final_price'))['final_price__sum'] or 0,
        }
        return Response(data)
