from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from backend.apps.orders.models import Order, OrderParameter, OrderItem, Payment
from backend.apps.orders.serializers.order_serializer import OrderSerializer, OrderParameterSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet для управления заказами."""
    queryset = Order.objects.all().select_related('user')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().select_related('user')
        return Order.objects.filter(user=self.request.user).select_related('user')


class OrderParameterViewSet(viewsets.ModelViewSet):
    """ViewSet для управления параметрами заказов."""
    queryset = OrderParameter.objects.all()
    serializer_class = OrderParameterSerializer
    permission_classes = [IsAuthenticated]
