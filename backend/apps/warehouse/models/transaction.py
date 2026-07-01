from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from django.utils import timezone


class WarehouseTransaction(models.Model):
    """
    Транзакции склада - приход, расход, перемещение.
    """
    TRANSACTION_TYPE_INCOME = 'income'
    TRANSACTION_TYPE_EXPENSE = 'expense'
    TRANSACTION_TYPE_TRANSFER = 'transfer'
    TRANSACTION_TYPE_ADJUSTMENT = 'adjustment'
    
    TRANSACTION_TYPE_CHOICES = [
        (TRANSACTION_TYPE_INCOME, 'Приход'),
        (TRANSACTION_TYPE_EXPENSE, 'Расход'),
        (TRANSACTION_TYPE_TRANSFER, 'Перемещение'),
        (TRANSACTION_TYPE_ADJUSTMENT, 'Корректировка'),
    ]
    
    item = models.ForeignKey(
        'WarehouseItem',
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    transaction_type = models.CharField(
        "Тип транзакции",
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES
    )
    quantity = models.IntegerField(
        "Количество",
        validators=[MinValueValidator(1)]
    )
    old_quantity = models.IntegerField("Старое количество", default=0)
    new_quantity = models.IntegerField("Новое количество", default=0)
    description = models.TextField("Описание", blank=True)
    related_order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='warehouse_transactions'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='warehouse_transactions'
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Транзакция склада'
        verbose_name_plural = 'Транзакции склада'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['item']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.item.name} ({self.quantity})"
