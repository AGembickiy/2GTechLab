from rest_framework import viewsets
from .models import Material, Printer, Order, FinancialMetrics
from .serializers import MaterialSerializer, PrinterSerializer, OrderSerializer, FinancialMetricsSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer


class PrinterViewSet(viewsets.ModelViewSet):
    queryset = Printer.objects.all()
    serializer_class = PrinterSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class FinancialMetricsViewSet(viewsets.ModelViewSet):
    queryset = FinancialMetrics.objects.all()
    serializer_class = FinancialMetricsSerializer