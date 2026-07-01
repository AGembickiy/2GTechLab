from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from backend.apps.catalog.models.material import Material
from backend.apps.catalog.models.printer import Printer
from backend.apps.catalog.serializers.catalog_serializer import MaterialSerializer, PrinterSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    """ViewSet для управления материалами."""
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PrinterViewSet(viewsets.ModelViewSet):
    """ViewSet для управления принтерами."""
    queryset = Printer.objects.all()
    serializer_class = PrinterSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
