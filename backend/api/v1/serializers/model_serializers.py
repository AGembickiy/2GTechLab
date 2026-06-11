from rest_framework import serializers


class STLAnalysisSerializer(serializers.Serializer):
    """Сериализатор для ответа анализа STL"""
    
    status = serializers.CharField()
    filename = serializers.CharField(required=False)
    
    dimensions_mm = serializers.DictField(child=serializers.FloatField(), required=False)
    volume_cm3 = serializers.FloatField(required=False)
    surface_area_cm2 = serializers.FloatField(required=False)
    vertices = serializers.IntegerField(required=False)
    faces = serializers.IntegerField(required=False)
    estimated_time_hours = serializers.FloatField(required=False)
    is_watertight = serializers.BooleanField(required=False)
    
    error = serializers.CharField(required=False)


class UploadResponseSerializer(serializers.Serializer):
    """Сериализатор для ответа загрузки файла"""
    
    status = serializers.CharField()
    file_url = serializers.URLField()
    task_id = serializers.CharField(required=False)
