from rest_framework import serializers
from backend.apps.orders.models import Order, OrderParameter, OrderItem, Payment


class OrderParameterSerializer(serializers.ModelSerializer):
    """Сериализатор параметров заказа."""
    class Meta:
        model = OrderParameter
        fields = ['scale', 'rotation_x', 'rotation_y', 'rotation_z', 'infill', 'layer_height']


class OrderItemSerializer(serializers.ModelSerializer):
    """Сериализатор элемента заказа."""
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'material', 'quantity', 'unit_price']


class PaymentSerializer(serializers.ModelSerializer):
    """Сериализатор платежа."""
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'status', 'payment_date', 'provider']


class OrderSerializer(serializers.ModelSerializer):
    """Сериализатор заказа с деталями."""
    parameters = OrderParameterSerializer(source='parameters', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_price', 'user', 'parameters', 'items', 'payment']
        read_only_fields = ['id', 'total_price', 'user']
