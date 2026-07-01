"""
API v1 accounts views.
"""
from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import models
from backend.apps.accounts.models.user import Profile
from backend.apps.accounts.serializers.user_serializer import UserSerializer, ProfileSerializer, LoginSerializer, RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from backend.core.throttling.throttling import BurstRateThrottle
from backend.core.throttling.throttling import LoginRateThrottle


def get_tokens_for_user(user):
    """Создать JWT токены для пользователя."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для управления пользователями."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'

    def get_queryset(self):
        if self.request.user.profile.role == 'admin':
            return User.objects.all().select_related('profile')
        return User.objects.filter(id=self.request.user.id).select_related('profile')

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]

    def create(self, request, *args, **kwargs):
        """Регистрация нового пользователя."""
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'User created successfully', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )


class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet для управления профилями."""
    queryset = Profile.objects.all().select_related('user')
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'

    def get_queryset(self):
        if self.request.user.profile.role == 'admin':
            return Profile.objects.all().select_related('user')
        return Profile.objects.filter(user=self.request.user).select_related('user')


class LoginView(APIView):
    """Вход в систему."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user:
            login(request, user)
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': tokens
            })
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=401
            )


class LogoutView(APIView):
    """Выход из системы."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})


class UserMeView(APIView):
    """Получить данные текущего пользователя."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user': UserSerializer(user).data
        })


class DashboardStatsView(APIView):
    """Статистика для дашборда администратора."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from backend.apps.orders.models import Order, OrderStatus
        from backend.apps.printers.models import Printer, PrinterStatus
        from backend.apps.finance.models import Transaction, TransactionCategory

        # Orders stats
        orders_in_progress = Order.objects.filter(
            status__in=[OrderStatus.ACCEPTED, OrderStatus.IN_PRINTING]
        ).count()
        ready_orders = Order.objects.filter(status=OrderStatus.READY_FOR_PICKUP).count()
        completed_orders = Order.objects.filter(status=OrderStatus.COMPLETED).count()

        # Printers stats
        idle_printers = Printer.objects.filter(status=PrinterStatus.IDLE).count()
        printing_printers = Printer.objects.filter(status=PrinterStatus.PRINTING).count()
        maintenance_printers = Printer.objects.filter(status=PrinterStatus.MAINTENANCE).count()

        # Finance stats
        revenue = Transaction.objects.filter(category=TransactionCategory.REVENUE).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        expenses = Transaction.objects.filter(category=TransactionCategory.EXPENSE).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        net_profit = revenue - expenses

        # Warehouse alerts (low stock)
        from backend.apps.catalog.models.warehouse import WarehouseItem
        low_stock_count = WarehouseItem.objects.filter(quantity_in_stock__lte=models.F('min_threshold')).count()

        return Response({
            'orders': {
                'in_progress': orders_in_progress,
                'ready_for_pickup': ready_orders,
                'completed': completed_orders,
            },
            'printers': {
                'idle': idle_printers,
                'printing': printing_printers,
                'maintenance': maintenance_printers,
            },
            'finance': {
                'revenue': float(revenue),
                'expenses': float(expenses),
                'net_profit': float(net_profit),
            },
            'warehouse': {
                'low_stock_alerts': low_stock_count,
            }
        })
