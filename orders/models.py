from django.db import models
from django.core.validators import MinValueValidator

class Material(models.Model):
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

    def __str__(self):
        return f"{self.name} ({self.color_hex})"

class Printer(models.Model):
    model_name = models.CharField("Модель", max_length=100)
    hourly_rate = models.DecimalField("Ставка часа", max_digits=10, decimal_places=2)
    is_active = models.BooleanField("Активен", default=True)
    last_maintenance = models.DateField("Последнее ТО", null=True, blank=True)

    def __str__(self):
        return self.model_name

class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('repairing', 'На ремонте'),
        ('slicing', 'В нарезке'),
        ('ready_to_print', 'Готов к печати'),
        ('printing', 'Печать'),
        ('logistics', 'Передан в логистику'),
        ('completed', 'Доставлен'),
        ('failed', 'Ошибка'),
    ]

    file = models.FileField(upload_to='orders/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Результаты обработки
    gcode_file = models.FileField(upload_to='gcode/', null=True, blank=True)
    estimated_weight = models.FloatField("Расчетный вес (г)", null=True, blank=True)
    estimated_time = models.IntegerField("Расчетное время (мин)", null=True, blank=True)
    final_price = models.DecimalField("Финальная цена", max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Связи
    material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True)
    printer = models.ForeignKey(Printer, on_delete=models.SET_NULL, null=True)

class OrderParameter(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='parameters')
    scale = models.FloatField(default=1.0)
    rotation_x = models.FloatField(default=0.0)
    rotation_y = models.FloatField(default=0.0)
    rotation_z = models.FloatField(default=0.0)
    infill = models.IntegerField(default=20)
    layer_height = models.FloatField(default=0.2)

    material = models.CharField(max_length=50, default='PLA')
