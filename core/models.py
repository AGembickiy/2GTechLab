from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User


class Material(models.Model):
    """Материалы для 3D-печати (унифицированная модель)."""
    CATEGORY_CHOICES = [
        ('filament', 'Материалы (филаменты)'),
        ('consumable', 'Расходные материалы'),
        ('packaging', 'Упаковочные материалы'),
    ]

    name = models.CharField("Название", max_length=100)
    category = models.CharField("Категория", max_length=20, choices=CATEGORY_CHOICES, default='filament')
    material_type = models.CharField("Тип материала", max_length=50, default="PLA")
    manufacturer = models.CharField("Производитель", max_length=120, blank=True)
    supplier = models.CharField("Поставщик", max_length=150, blank=True)
    color_hex = models.CharField("Цвет (HEX)", max_length=7, default="#FFFFFF")
    price_per_kg = models.DecimalField("Цена за кг", max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField("Цена закупки", max_digits=10, decimal_places=2, null=True, blank=True)
    weight_g = models.FloatField("Остаток на складе (г)", default=0)
    actual_weight_g = models.FloatField("Фактический остаток (г)", default=0)
    previous_inventory_date = models.DateField("Дата прошлой инвентаризации", null=True, blank=True)
    next_inventory_date = models.DateField("Дата следующей инвентаризации", null=True, blank=True)
    delivery_date = models.DateField("Дата поставки", null=True, blank=True)
    expiration_date = models.DateField("Срок годности", null=True, blank=True)
    min_weight_g = models.FloatField("Минимальный остаток (г)", default=0)
    density = models.FloatField("Плотность (г/см3)", default=1.25)
    print_temperature_c = models.IntegerField("Температура печати (°C)", null=True, blank=True)
    filament_diameter_mm = models.FloatField("Диаметр нити (мм)", null=True, blank=True)
    spool_weight_g = models.FloatField("Вес катушки (г)", null=True, blank=True)
    filament_length_m = models.FloatField("Длина нити (м)", null=True, blank=True)
    notes = models.TextField("Примечания", blank=True)

    class Meta:
        verbose_name = 'Материал'
        verbose_name_plural = 'Материалы'

    def __str__(self):
        return f"{self.name} ({self.color_hex})"


class Printer(models.Model):
    """3D-принтеры."""
    model_name = models.CharField("Модель", max_length=100)
    hourly_rate = models.DecimalField("Ставка часа", max_digits=10, decimal_places=2)
    is_active = models.BooleanField("Активен", default=True)
    last_maintenance = models.DateField("Последнее ТО", null=True, blank=True)
    max_temp = models.IntegerField("Максимальная температура сопла (°C)", default=300)
    build_volume = models.CharField("Объем рабочей зоны", max_length=50, default="220x220x250")

    class Meta:
        verbose_name = 'Принтер'
        verbose_name_plural = 'Принтеры'

    def __str__(self):
        return self.model_name


class PrintJob(models.Model):
    """Задание на печать (унифицированная модель)."""
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('preview', 'Предпросмотр'),
        ('repairing', 'На ремонте'),
        ('slicing', 'В нарезке'),
        ('ready_to_print', 'Готов к печати'),
        ('printing', 'Печать'),
        ('logistics', 'Передан в логистику'),
        ('completed', 'Доставлен'),
        ('failed', 'Ошибка'),
    ]

    UPLOAD_KIND_CHOICES = [
        ('model', '3D-модель'),
        ('sketch', 'Эскиз / 2D'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='print_jobs')
    file = models.FileField(upload_to='uploads/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    upload_kind = models.CharField("Тип загрузки", max_length=10, choices=UPLOAD_KIND_CHOICES, default='model')
    sketch_width_mm = models.FloatField("Ширина эскиза (мм)", null=True, blank=True)
    sketch_height_mm = models.FloatField("Высота эскиза (мм)", null=True, blank=True)
    sketch_thickness_mm = models.FloatField("Толщина эскиза (мм)", null=True, blank=True)
    
    # Результаты обработки
    original_file = models.FileField(upload_to='uploads/', null=True, blank=True)
    converted_stl = models.FileField(upload_to='stl/', null=True, blank=True)
    converted_glb = models.FileField(upload_to='glb/', null=True, blank=True)
    converted_3mf = models.FileField(upload_to='3mf/', null=True, blank=True)
    gcode_file = models.FileField(upload_to='gcode/', null=True, blank=True)
    
    estimated_weight = models.FloatField("Расчетный вес (г)", null=True, blank=True)
    estimated_time_minutes = models.IntegerField("Расчетное время (мин)", null=True, blank=True)
    final_price = models.DecimalField("Финальная цена", max_digits=10, decimal_places=2, null=True, blank=True)
    
    moonraker_job_id = models.CharField("Moonraker job ID", max_length=64, blank=True, null=True)
    last_error = models.TextField("Последняя ошибка", blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Задание на печать'
        verbose_name_plural = 'Задания на печать'
        ordering = ['-created_at']

    def __str__(self):
        return f"PrintJob #{self.pk} ({self.status})"


class PrintJobSurface(models.Model):
    """Поверхности модели для выбора параметров печати."""
    job = models.ForeignKey(PrintJob, on_delete=models.CASCADE, related_name='surfaces')
    name = models.CharField("Название", max_length=100)
    index = models.PositiveIntegerField("Индекс")
    selected = models.BooleanField("Выбрано", default=False)
    slot_assignment = models.PositiveSmallIntegerField("Назначение слота", null=True, blank=True)

    class Meta:
        verbose_name = 'Поверхность модели'
        verbose_name_plural = 'Поверхности модели'


class PrintJobMaterialAssignment(models.Model):
    """Назначение материалов на слоты/части модели."""
    job = models.ForeignKey(PrintJob, on_delete=models.CASCADE, related_name='material_assignments')
    slot_index = models.PositiveSmallIntegerField("Индекс слота")
    material = models.ForeignKey(Material, on_delete=models.PROTECT, verbose_name="Материал")
    length_mm = models.FloatField("Длина (мм)", null=True, blank=True)
    mass_g = models.FloatField("Масса (г)", null=True, blank=True)
    cost = models.DecimalField("Стоимость", max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = 'Назначение материала'
        verbose_name_plural = 'Назначения материалов'
        ordering = ['slot_index']
        unique_together = ['job', 'slot_index']

    def __str__(self):
        return f"{self.job} - Слот {self.slot_index}: {self.material.name}"


class Order(models.Model):
    """Заказы клиентов (расширенная модель)."""
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('confirmed', 'Подтвержден'),
        ('processing', 'В обработке'),
        ('printing', 'Печать'),
        ('finished', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]

    order_number = models.CharField("Номер заказа", max_length=50, unique=True, blank=True)
    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default='new')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    print_job = models.ForeignKey(PrintJob, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    total_price = models.DecimalField("Общая стоимость", max_digits=10, decimal_places=2, default=0)
    shipping_address = models.TextField("Адрес доставки", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ #{self.order_number or self.pk}"


class OrderItem(models.Model):
    """Позиции заказа."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    print_job = models.ForeignKey(PrintJob, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField("Количество", default=1)
    unit_price = models.DecimalField("Цена за единицу", max_digits=10, decimal_places=2)
    total_price = models.DecimalField("Общая цена", max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказов'

    def __str__(self):
        return f"{self.order} - {self.print_job}"
