from django.db import models
from django.core.validators import MinValueValidator

class Material(models.Model):
    name = models.CharField("Название", max_length=100)
    color_hex = models.CharField("Цвет (HEX)", max_length=7, default="#FFFFFF")
    price_per_kg = models.DecimalField("Цена за кг", max_digits=10, decimal_places=2)
    weight_g = models.FloatField("Остаток на складе (г)", default=0)
    density = models.FloatField("Плотность (г/см3)", default=1.25)

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
