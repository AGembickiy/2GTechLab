from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User


class InventoryAudit(models.Model):
    """
    Инвентаризация склада.
    """
    STATUS_PLANNED = 'planned'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELED = 'canceled'
    
    STATUS_CHOICES = [
        (STATUS_PLANNED, 'Запланирована'),
        (STATUS_IN_PROGRESS, 'В процессе'),
        (STATUS_COMPLETED, 'Завершена'),
        (STATUS_CANCELED, 'Отменена'),
    ]
    
    title = models.CharField("Название", max_length=255)
    description = models.TextField("Описание", blank=True)
    status = models.CharField(
        "Статус",
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PLANNED
    )
    planned_date = models.DateField("Планируемая дата")
    completed_at = models.DateTimeField("Завершено", null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_audits'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Инвентаризация'
        verbose_name_plural = 'Инвентаризации'
        ordering = ['-planned_date']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class InventoryAuditItem(models.Model):
    """
    Элементы инвентаризации - фактическое количество.
    """
    audit = models.ForeignKey(
        'InventoryAudit',
        on_delete=models.CASCADE,
        related_name='items'
    )
    warehouse_item = models.ForeignKey(
        'WarehouseItem',
        on_delete=models.PROTECT,
        related_name='audit_items'
    )
    system_quantity = models.IntegerField("Системное количество", default=0)
    actual_quantity = models.IntegerField("Фактическое количество", default=0)
    difference = models.IntegerField("Разница", default=0)
    notes = models.TextField("Примечания", blank=True)
    verified = models.BooleanField("Проверено", default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_audit_items'
    )
    verified_at = models.DateTimeField("Проверено", null=True, blank=True)

    class Meta:
        verbose_name = 'Элемент инвентаризации'
        verbose_name_plural = 'Элементы инвентаризации'

    def __str__(self):
        return f"{self.audit.title} - {self.warehouse_item.name}"

    def save(self, *args, **kwargs):
        self.difference = self.actual_quantity - self.system_quantity
        super().save(*args, **kwargs)
