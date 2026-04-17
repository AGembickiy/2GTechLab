from rest_framework import serializers
from .models import Material, Printer, Order, FinancialMetrics

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Printer
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class FinancialMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialMetrics
        fields = '__all__'