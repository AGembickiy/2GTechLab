"""
Order Views
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from backend.services.pricing.service import PricingService
from backend.services.printing.service import PrintingService
from backend.shop.models import Order, OrderItem, Product
from backend.user_profiles.models import UserProfile


class OrderListCreateView(APIView):
    """Список и создание заказов"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Получение списка заказов пользователя"""
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        data = [
            {
                'id': order.id,
                'status': order.status,
                'total_price': order.total_price,
                'created_at': order.created_at.isoformat(),
            }
            for order in orders
        ]
        return Response(data)
    
    def post(self, request):
        """Создание нового заказа"""
        user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        # Получаем данные из request.data
        items_data = request.data.get('items', [])
        shipping_address = request.data.get('shipping_address', '')
        
        if not items_data:
            return Response(
                {'error': 'Необходимо указать items'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_address,
            status='pending'
        )
        
        total_price = 0
        for item_data in items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            try:
                product = Product.objects.get(id=product_id)
                price = product.price * quantity
                total_price += price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )
            except Product.DoesNotExist:
                order.delete()
                return Response(
                    {'error': f'Товар с ID {product_id} не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        order.total_price = total_price
        order.save()
        
        return Response({
            'id': order.id,
            'status': order.status,
            'total_price': order.total_price,
            'created_at': order.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """Детальная информация о заказе"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """Получение заказа"""
        try:
            order = Order.objects.get(id=pk, user=request.user)
            data = {
                'id': order.id,
                'status': order.status,
                'total_price': order.total_price,
                'shipping_address': order.shipping_address,
                'created_at': order.created_at.isoformat(),
                'items': [
                    {
                        'product': {
                            'id': item.product.id,
                            'name': item.product.name,
                            'price': item.product.price,
                        },
                        'quantity': item.quantity,
                        'price': item.price,
                    }
                    for item in order.items.all()
                ]
            }
            return Response(data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Заказ не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


class CalculatePriceView(APIView):
    """Расчёт стоимости печати"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        """Расчёт цены для заказа"""
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Заказ не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Получаем параметры расчёта
        service = PricingService()
        
        volume_cm3 = request.data.get('volume_cm3', 0)
        material = request.data.get('material', 'PLA')
        fill_percentage = request.data.get('fill_percentage', 15)
        post_processing = request.data.get('post_processing', 'none')
        has_support = request.data.get('has_support', False)
        
        result = service.calculate(
            volume_cm3=volume_cm3,
            material=material,
            fill_percentage=fill_percentage,
            post_processing=post_processing,
            has_support=has_support
        )
        
        return Response(result)
