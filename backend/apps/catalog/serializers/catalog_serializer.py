from rest_framework import serializers
from backend.apps.catalog.models.material import Material
from backend.apps.catalog.models.printer import Printer


class MaterialSerializer(serializers.ModelSerializer):
    """Сериализатор материала."""
    class Meta:
        model = Material
        fields = ['id', 'name', 'price_per_gram']
        read_only_fields = ['id']


class PrinterSerializer(serializers.ModelSerializer):
    """Сериализатор принтера."""
    class Meta:
        model = Printer
        fields = ['id', 'name', 'max_temperature']
        read_only_fields = ['id']
