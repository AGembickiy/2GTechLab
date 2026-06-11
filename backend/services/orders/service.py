from decimal import Decimal
from datetime import timedelta
from typing import Dict, List, Optional
from django.utils import timezone

from orders.models import Order, OrderParameter, Material, Printer


class OrderService:
    """Сервис управления заказами"""

    def create_from_stl(
        self,
        file_path: str,
        user_email: str,
        material: str = 'PLA',
        infill: int = 20,
        scale: float = 1.0,
    ) -> Dict[str, any]:
        """
        Создание заказа из STL файла.
        
        Args:
            file_path: Путь к STL файлу
            user_email: Email пользователя
            material: Тип материала
            infill: Процент заполнения
            scale: Масштаб модели
            
        Returns:
            Dict с информацией о созданном заказе
        """
        from backend.services.pricing.service import PricingService
        from orders.models import Order, OrderParameter
        
        pricing_service = PricingService()
        analysis = pricing_service.analyze_stl(file_path)
        
        if analysis['status'] != 'success':
            return {'status': 'error', 'message': analysis.get('error', 'Failed to analyze STL')}
        
        # Получение материала или создание нового
        mat, created = Material.objects.get_or_create(
            material_type=material.upper(),
            defaults={'name': f'PLA {material.upper()}', 'price_per_kg': Decimal('25.00')}
        )
        
        # Получение принтера по умолчанию
        default_printer = Printer.objects.filter(is_active=True).first()
        if not default_printer:
            return {'status': 'error', 'message': 'No active printer available'}
        
        # Расчет параметров
        volume_cm3 = analysis['volume_cm3']
        estimated_time_hours = analysis['estimated_time_hours']
        estimated_time_minutes = int(estimated_time_hours * 60)
        estimated_weight_g = volume_cm3 * 1.25  # Плотность PLA ~1.25 g/cm³
        
        # Создание заказа
        order = Order.objects.create(
            file=file_path,
            status='new',
            estimated_weight=round(estimated_weight_g, 2),
            estimated_time=estimated_time_minutes,
            material=mat,
            printer=default_printer,
        )
        
        # Создание параметров заказа
        OrderParameter.objects.create(
            order=order,
            scale=scale,
            infill=infill,
            layer_height=0.2,
            material=material.upper(),
        )
        
        return {
            'status': 'success',
            'order_id': order.id,
            'estimated_weight_g': estimated_weight_g,
            'estimated_time_minutes': estimated_time_minutes,
            'volume_cm3': volume_cm3,
        }

    def update_status(self, order_id: int, new_status: str) -> Dict[str, any]:
        """
        Обновление статуса заказа.
        
        Args:
            order_id: ID заказа
            new_status: Новый статус
            
        Returns:
            Dict с результатом обновления
        """
        try:
            order = Order.objects.get(id=order_id)
            old_status = order.status
            
            if new_status not in dict(Order.STATUS_CHOICES):
                return {'status': 'error', 'message': 'Invalid status'}
            
            order.status = new_status
            order.save()
            
            return {
                'status': 'success',
                'order_id': order_id,
                'old_status': old_status,
                'new_status': new_status,
                'updated_at': timezone.now().isoformat(),
            }
        except Order.DoesNotExist:
            return {'status': 'error', 'message': 'Order not found'}

    def get_order_details(self, order_id: int) -> Optional[Dict[str, any]]:
        """
        Получение детальной информации о заказе.
        
        Args:
            order_id: ID заказа
            
        Returns:
            Dict с деталями заказа или None
        """
        try:
            order = Order.objects.get(id=order_id)
            
            parameters = {}
            if hasattr(order, 'parameters'):
                params = order.parameters
                parameters = {
                    'scale': params.scale,
                    'infill': params.infill,
                    'layer_height': params.layer_height,
                    'material': params.material,
                }
            
            return {
                'id': order.id,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'file': order.file.url if order.file else None,
                'gcode_file': order.gcode_file.url if order.gcode_file else None,
                'estimated_weight': order.estimated_weight,
                'estimated_time': order.estimated_time,
                'final_price': float(order.final_price) if order.final_price else None,
                'material': {
                    'id': order.material.id,
                    'name': order.material.name,
                    'type': order.material.material_type,
                } if order.material else None,
                'printer': {
                    'id': order.printer.id,
                    'model': order.printer.model_name,
                } if order.printer else None,
                'parameters': parameters,
            }
        except Order.DoesNotExist:
            return None

    def get_orders_by_user(self, user_email: str) -> List[Dict[str, any]]:
        """
        Получение заказов пользователя.
        
        Args:
            user_email: Email пользователя
            
        Returns:
            Список заказов пользователя
        """
        # TODO: Связать Order с User
        # Сейчас возвращаются все заказы (заглушка)
        orders = Order.objects.all().order_by('-created_at')
        
        return [
            {
                'id': order.id,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'estimated_weight': order.estimated_weight,
                'estimated_time': order.estimated_time,
            }
            for order in orders
        ]

    def calculate_final_price(self, order_id: int) -> Dict[str, any]:
        """
        Расчет финальной стоимости заказа.
        
        Args:
            order_id: ID заказа
            
        Returns:
            Dict с детализацией цены
        """
        from backend.services.pricing.service import PricingService
        
        try:
            order = Order.objects.get(id=order_id)
            
            if order.estimated_weight is None or order.estimated_time is None:
                return {'status': 'error', 'message': 'Order parameters not available'}
            
            pricing_service = PricingService()
            
            volume_cm3 = order.estimated_weight / 1.25  # Обратный расчет объема
            estimated_time_hours = order.estimated_time / 60
            
            material_type = 'PLA'
            if order.material:
                material_type = order.material.material_type
            
            result = pricing_service.calculate(
                volume_cm3=volume_cm3,
                material=material_type,
                fill_percentage=order.parameters.infill if hasattr(order, 'parameters') else 20,
                estimated_time_hours=estimated_time_hours,
            )
            
            order.final_price = result['total']
            order.save()
            
            return {
                'status': 'success',
                'order_id': order_id,
                'price_details': result,
            }
            
        except Order.DoesNotExist:
            return {'status': 'error', 'message': 'Order not found'}
