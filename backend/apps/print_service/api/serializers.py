from rest_framework import serializers
from ..models import Equipment, Material

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'color_hex']

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['id', 'name']

class DetectEquipmentResponseSerializer(serializers.Serializer):
    equipment = EquipmentSerializer()
    palette = MaterialSerializer(many=True)
    message = serializers.CharField()