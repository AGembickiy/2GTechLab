from django.db import models


class Equipment(models.Model):
    """Модель для 3D-принтеров с указанием их характеристик."""
    name = models.CharField(max_length=100, unique=True)
    max_temp = models.IntegerField(help_text="Максимальная температура сопла в градусах Цельсия")
    build_volume_m3 = models.FloatField(help_text="Объем рабочей зоны в кубических метрах")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Оборудование'
        verbose_name_plural = 'Оборудование'

    def __str__(self) -> str:
        return self.name


class PrinterStatus(models.TextChoices):
    """Статусы принтера."""
    IDLE = "idle", "Ожидание"
    PRINTING = "printing", "Печать"
    MAINTENANCE = "maintenance", "Обслуживание"


class Printer(Equipment):
    """Модель для 3D-принтеров с расширенными характеристиками."""
    serial_number = models.CharField("Серийный номер", max_length=255, unique=True)
    purchase_date = models.DateField("Дата покупки", null=True, blank=True)
    warranty_end = models.DateField("Конец гарантии", null=True, blank=True)
    working_hours = models.FloatField("Отработанные часы", default=0)
    technology = models.CharField("Технология", max_length=20, default="FDM")
    bed_size_x = models.FloatField("Размер стола X (мм)", default=200)
    bed_size_y = models.FloatField("Размер стола Y (мм)", default=200)
    bed_size_z = models.FloatField("Размер стола Z (мм)", default=200)
    status = models.CharField(
        "Статус",
        max_length=20,
        choices=PrinterStatus.choices,
        default=PrinterStatus.IDLE
    )

    class Meta:
        verbose_name = 'Принтер'
        verbose_name_plural = 'Принтеры'

    def __str__(self) -> str:
        return f"{self.name} ({self.serial_number})"

    def get_build_volume(self) -> str:
        """Возвращает объем рабочей зоны."""
        return f"{self.bed_size_x}x{self.bed_size_y}x{self.bed_size_z} mm"
