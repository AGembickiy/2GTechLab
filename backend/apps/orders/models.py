"""
Orders models package.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils import timezone


class OrderStatus(models.TextChoices):
    """Статусы заказа - state machine."""
    DRAFT = "draft", "Черновик"
    ACCEPTED = "accepted", "Принят"
    IN_PRINTING = "in_printing", "В печати"
    READY_FOR_PICKUP = "ready", "Готов к выдаче"
    COMPLETED = "completed", "Завершен"
    CANCELLED = "cancelled", "Отменен"


class Order(models.Model):
    """Заказы."""
    status = models.CharField(
        "Статус",
        max_length=30,
        choices=OrderStatus.choices,
        default=OrderStatus.DRAFT
    )
    total_price = models.DecimalField("Общая цена", max_digits=10, decimal_places=2, default=0)
    estimated_cost = models.DecimalField(
        "Оценочная цена",
        max_digits=10,
        decimal_places=2,
        default=0
    )
    final_cost = models.DecimalField(
        "Финальная цена",
        max_digits=10,
        decimal_places=2,
        default=0
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="orders")
    material = models.ForeignKey(
        "catalog.Material",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )
    printer = models.ForeignKey(
        "printers.Printer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )
    quantity = models.IntegerField("Количество", default=1, validators=[MinValueValidator(1)])

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.pk} - {self.get_status_display()}"


class OrderParameter(models.Model):
    """Параметры заказа."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='parameters')
    scale = models.FloatField(default=1.0)
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    infill = models.IntegerField(default=20, validators=[MinValueValidator(0), MaxValueValidator(100)])
    layer_height = models.FloatField(default=0.2)

    class Meta:
        verbose_name = 'Параметр заказа'
        verbose_name_plural = 'Параметры заказов'

    def __str__(self):
        return f"Parameters for Order #{self.order.pk}"


class OrderItem(models.Model):
    """Элементы заказа."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey('catalog.Material', on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField("Цена за единицу", max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'Элемент заказа'
        verbose_name_plural = 'Элементы заказов'

    def __str__(self):
        return f"Item {self.id} for Order {self.order_id}"


class Payment(models.Model):
    """Платежи."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField("Сумма", max_digits=10, decimal_places=2)
    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_date = models.DateTimeField(null=True, blank=True)
    provider = models.CharField("Провайдер", max_length=50, default='card')

    class Meta:
        verbose_name = 'Платеж'
        verbose_name_plural = 'Платежи'

    def __str__(self):
        return f"Payment {self.id} for Order {self.order_id}"
