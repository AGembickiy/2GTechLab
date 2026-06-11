from rest_framework import serializers
from backend.shop.models import Product, Order, OrderItem


class ProductSerializer(serializers.ModelSerializer):
    """Сериализатор для продуктов"""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'image', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Сериализатор для позиций заказа"""
    
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    """Сериализатор для заказов"""
    
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'items', 'total_price',
            'status', 'shipping_address', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'total_price', 'status', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """Сериализатор для создания заказа"""
    
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        help_text='Список items с product_id и quantity'
    )
    shipping_address = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        fields = ['items', 'shipping_address']


class CalculatePriceRequestSerializer(serializers.Serializer):
    """Сериализатор для запроса расчёта цены печати"""
    
    volume_cm3 = serializers.FloatField(required=False, help_text='Объём модели в см³')
    material = serializers.CharField(required=False, default='PLA')
    fill_percentage = serializers.IntegerField(required=False, default=15, min_value=5, max_value=100)
    post_processing = serializers.CharField(required=False, default='none')
    has_support = serializers.BooleanField(required=False, default=False)
    estimated_time_hours = serializers.FloatField(required=False, default=0)
    
    def validate(self, data):
        if not data.get('volume_cm3'):
            raise serializers.ValidationError('Требуется volume_cm3')
        return data
