from typing import List
from decimal import Decimal
from backend.apps.orders.models import Order, OrderStatus
from backend.repositories.orders.order_repository import OrderRepository
from backend.services.pricing.pricing_service import PricingService


class OrderService:
    """Сервис управления заказами."""

    def accept_order(self, order: Order) -> Order:
        """
        Принять заказ в работу.
        Расчитывает цену, резервирует материал и назначает принтер.
        """
        # Расчет стоимости
        pricing_service = PricingService()
        # TODO: получить параметры из order.parameters
        result = pricing_service.calculate(volume_cm3=100, material='PLA')
        order.estimated_cost = Decimal(str(result['total']))
        order.final_cost = order.estimated_cost

        # Резервирование материала
        if order.material:
            self._reserve_material(order)

        # Назначение принтера
        if order.printer is None:
            self._assign_printer(order)

        # Обновление статуса
        order.status = OrderStatus.ACCEPTED
        order.save()

        return order

    def start_printing(self, order: Order) -> Order:
        """Начать печать заказа."""
        order.status = OrderStatus.IN_PRINTING
        order.save()
        return order

    def complete_order(self, order: Order) -> Order:
        """Завершить заказ."""
        order.status = OrderStatus.COMPLETED
        order.save()
        return order

    def cancel_order(self, order: Order) -> Order:
        """Отменить заказ."""
        order.status = OrderStatus.CANCELLED
        order.save()
        return order

    def ready_for_pickup(self, order: Order) -> Order:
        """Пометить заказ как готовый к выдаче."""
        order.status = OrderStatus.READY_FOR_PICKUP
        order.save()
        return order

    def _reserve_material(self, order: Order) -> None:
        """Резервировать материал для заказа."""
        if order.material:
            warehouse_service = WarehouseService()
            warehouse_service.reserve(order.material, order.quantity)

    def _assign_printer(self, order: Order) -> None:
        """Назначить свободный принтер для заказа."""
        from backend.services.printing.printer_assignment_service import PrinterAssignmentService
        printer = PrinterAssignmentService.find_available_printer()
        if printer:
            order.printer = printer
            order.save()

    def get_dashboard_stats(self) -> dict:
        """Получить статистику для дашборда."""
        from backend.services.orders.order_service import OrderService

        orders_in_progress = OrderRepository.get_in_progress_orders().count()
        ready_orders = OrderRepository.get_ready_orders().count()
        completed_orders = OrderRepository.get_by_status(OrderStatus.COMPLETED).count()

        return {
            "orders_in_progress": orders_in_progress,
            "ready_for_pickup": ready_orders,
            "completed_orders": completed_orders,
        }


class WarehouseService:
    """Сервис управления складом."""

    @staticmethod
    def reserve(material, quantity: float) -> None:
        """Резервировать материал для заказа."""
        from backend.repositories.catalog.warehouse_repository import WarehouseRepository
        from django.core.exceptions import ValidationError

        item = WarehouseRepository.get_by_id(material.id)
        if not item:
            raise ValidationError(f"Material with id {material.id} not found")

        if item.quantity_in_stock < quantity:
            raise ValidationError("Not enough material in stock")

        # Резервирование (уменьшаем доступное количество)
        WarehouseRepository.update_stock(item, -quantity)

    @staticmethod
    def deduct(order) -> None:
        """Списать материал после завершения заказа."""
        from backend.repositories.catalog.warehouse_repository import WarehouseRepository

        if order.material:
            item = WarehouseRepository.get_by_id(order.material.id)
            if item:
                WarehouseRepository.update_stock(item, -order.quantity)

    @staticmethod
    def return_to_stock(order) -> None:
        """Вернуть материал на склад при отмене заказа."""
        from backend.repositories.catalog.warehouse_repository import WarehouseRepository

        if order.material:
            item = WarehouseRepository.get_by_id(order.material.id)
            if item:
                WarehouseRepository.update_stock(item, order.quantity)