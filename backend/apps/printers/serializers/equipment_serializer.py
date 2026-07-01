from rest_framework import serializers
from backend.apps.printers.models.equipment import Equipment


class EquipmentSerializer(serializers.ModelSerializer):
    """Сериализатор оборудования/принтера."""
    class Meta:
        model = Equipment
        fields = ['id', 'name', 'max_temp', 'build_volume_m3', 'is_active']
        read_only_fields = ['id']
