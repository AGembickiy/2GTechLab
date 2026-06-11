from rest_framework.response import Response
from rest_framework.views import APIView
from backend.services.pricing.service import PricingService
from backend.api.v1.serializers.pricing_serializers import CalculatePriceRequestSerializer


class CalculatePriceView(APIView):
    """Калькулятор стоимости печати"""
    
    def post(self, request):
        """Расчёт стоимости"""
        serializer = CalculatePriceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        service = PricingService()
        result = service.calculate(
            volume_cm3=data['volume_cm3'],
            material=data.get('material', 'PLA'),
            fill_percentage=data.get('fill_percentage', 15),
            post_processing=data.get('post_processing', 'none'),
            has_support=data.get('has_support', False),
            estimated_time_hours=data.get('estimated_time_hours', 0)
        )
        
        return Response(result)
