from typing import List, Optional
from django.db.models import QuerySet, models
from django.core.exceptions import ObjectDoesNotExist
from backend.apps.orders.models import Order, OrderStatus


class OrderRepository:
    """Репозиторий для работы с заказами."""

    @staticmethod
    def get_by_id(order_id: int) -> Optional[Order]:
        """Получить заказ по ID."""
        try:
            return Order.objects.select_related(
                "user",
                "material",
                "printer"
            ).get(pk=order_id)
        except Order.DoesNotExist:
            return None

    @staticmethod
    def get_all() -> QuerySet[Order]:
        """Получить все заказы."""
        return Order.objects.select_related("user", "material", "printer")

    @staticmethod
    def get_by_status(status: str) -> QuerySet[Order]:
        """Получить заказы по статусу."""
        return Order.objects.filter(status=status)

    @staticmethod
    def get_by_user(user_id: int) -> QuerySet[Order]:
        """Получить заказы пользователя."""
        return Order.objects.filter(user_id=user_id)

    @staticmethod
    def create(
        status: str = OrderStatus.DRAFT,
        estimated_cost: float = 0,
        final_cost: float = 0,
        user_id: int = None,
        material_id: int = None,
        printer_id: int = None,
        quantity: int = 1
    ) -> Order:
        """Создать новый заказ."""
        return Order.objects.create(
            status=status,
            estimated_cost=estimated_cost,
            final_cost=final_cost,
            user_id=user_id,
            material_id=material_id,
            printer_id=printer_id,
            quantity=quantity
        )

    @staticmethod
    def update_status(order: Order, new_status: str) -> Order:
        """Обновить статус заказа."""
        order.status = new_status
        order.save()
        return order

    @staticmethod
    def assign_printer(order: Order, printer_id: int) -> Order:
        """Назначить принтер для заказа."""
        order.printer_id = printer_id
        order.save()
        return order

    @staticmethod
    def update_costs(
        order: Order,
        estimated_cost: float = None,
        final_cost: float = None
    ) -> Order:
        """Обновить цены заказа."""
        if estimated_cost is not None:
            order.estimated_cost = estimated_cost
        if final_cost is not None:
            order.final_cost = final_cost
        order.save()
        return order

    @staticmethod
    def get_in_progress_orders() -> QuerySet[Order]:
        """Получить заказы в работе."""
        return Order.objects.filter(
            status__in=[OrderStatus.ACCEPTED, OrderStatus.IN_PRINTING]
        )

    @staticmethod
    def get_ready_orders() -> QuerySet[Order]:
        """Получить заказы, готовые к выдаче."""
        return Order.objects.filter(status=OrderStatus.READY_FOR_PICKUP)
