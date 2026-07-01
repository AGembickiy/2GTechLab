from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from backend.apps.printers.models.equipment import Equipment
from backend.apps.printers.serializers.equipment_serializer import EquipmentSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet для управления оборудованием/принтерами."""
    queryset = Equipment.objects.filter(is_active=True)
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
