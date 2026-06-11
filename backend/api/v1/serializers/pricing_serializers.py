from rest_framework import serializers


class CalculatePriceRequestSerializer(serializers.Serializer):
    """Сериализатор для запроса расчёта цены печати"""
    
    volume_cm3 = serializers.FloatField(required=True, help_text='Объём модели в см³')
    material = serializers.CharField(required=False, default='PLA')
    fill_percentage = serializers.IntegerField(required=False, default=15, min_value=5, max_value=100)
    post_processing = serializers.CharField(required=False, default='none')
    has_support = serializers.BooleanField(required=False, default=False)
    estimated_time_hours = serializers.FloatField(required=False, default=0)
