from rest_framework import serializers
from .models import Order, OrderParameter, Material, Printer

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Printer
        fields = '__all__'

class OrderParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderParameter
        fields = ['scale', 'rotation_x', 'rotation_y', 'rotation_z', 'infill', 'layer_height']

class OrderSerializer(serializers.ModelSerializer):
    parameters = OrderParameterSerializer()
    material_details = MaterialSerializer(source='material', read_only=True)
    printer_details = PrinterSerializer(source='printer', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'file', 'status', 'created_at', 'gcode_file', 
            'estimated_weight', 'estimated_time', 'final_price', 
            'material', 'printer', 'parameters', 'material_details', 'printer_details'
        ]

    def create(self, validated_data):
        params_data = validated_data.pop('parameters')
        order = Order.objects.create(**validated_data)
        OrderParameter.objects.create(order=order, **params_data)
        return order
