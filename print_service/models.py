from django.contrib.auth.models import User
from django.db import models

class Equipment(models.Model):
    """Модель для 3D-принтеров с указанием их характеристик."""
    name = models.CharField(max_length=100, unique=True)
    max_temp = models.IntegerField(help_text="Максимальная температура сопла в градусах Цельсия")
    build_volume_m3 = models.FloatField(help_text="Объем рабочей зоны в кубических метрах")

    def __str__(self) -> str:
        return self.name

class Material(models.Model):
    """Модель для материалов 3D-печати с температурным диапазоном."""
    name = models.CharField(max_length=100, unique=True)
    temp_range_min = models.IntegerField()
    temp_range_max = models.IntegerField()
    color_hex = models.CharField(max_length=7)  # HEX-код цвета материала

    def __str__(self) -> str:
        return self.name

class EquipmentMaterial(models.Model):
    """Связь многие-ко-многим между оборудованием и материалами."""
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    
    class Meta:
        # Добавляем индексы для ускорения фильтрации по связям
        indexes = [
            models.Index(fields=['equipment', 'material']),
            models.Index(fields=['equipment']),
        ]
        unique_together = ('equipment', 'material')

class MaterialPreset(models.Model):
    """Предустановки материалов для 3D печати."""
    TYPE_CHOICES = [
        ("PLA", "PLA"),
        ("PETG", "PETG"),
        ("ABS", "ABS"),
        ("TPU", "TPU"),
    ]
    COLOR_CHOICES = [
        ("#FF0000", "Красный"),
        ("#00FF00", "Зеленый"),
        ("#0000FF", "Синий"),
        ("#FFFF00", "Желтый"),
        ("#FF00FF", "Пурпурный"),
        ("#00FFFF", "Голубой"),
        ("#FFFFFF", "Белый"),
        ("#000000", "Черный"),
    ]
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="PLA")
    color_hex = models.CharField(max_length=7, choices=COLOR_CHOICES, default="#FFFFFF")  # HEX-код цвета материала
    density_g_per_cm3 = models.FloatField(default=1.24)
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.name} ({self.color_hex})"

class PrintJob(models.Model):
    """Задание на печать, содержащее файлы и статус обработки."""
    STATUS_CHOICES = [
        ("draft", "Черновик"),
        ("preview", "Предпросмотр"),
        ("slicing", "Слайсинг"),
        ("ready", "Готово"),
        ("ordered", "Заказано"),
        ("error", "Ошибка"),
    ]
    UPLOAD_KIND_CHOICES = [
        ("model", "3D-модель"),
        ("sketch", "Эскиз / 2D"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    from .validators import validate_file_size, validate_3d_file, validate_2d_file
    
    original_file = models.FileField(
        upload_to="uploads/",
        validators=[validate_file_size, validate_3d_file, validate_2d_file]
    )
    converted_stl = models.FileField(upload_to="stl/", blank=True, null=True)
    converted_glb = models.FileField(upload_to="glb/", blank=True, null=True)
    converted_3mf = models.FileField(upload_to="3mf/", blank=True, null=True)
    gcode_file = models.FileField(upload_to="gcode/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    upload_kind = models.CharField(
        max_length=10,
        choices=UPLOAD_KIND_CHOICES,
        default="model",
        help_text="Тип загрузки: модель для предпросмотра STL или эскиз с размерами.",
    )
    sketch_width_mm = models.FloatField(null=True, blank=True)
    sketch_height_mm = models.FloatField(null=True, blank=True)
    sketch_thickness_mm = models.FloatField(null=True, blank=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.upload_kind == "sketch" and self.status != "draft":
            if not all([self.sketch_width_mm, self.sketch_height_mm, self.sketch_thickness_mm]):
                raise ValidationError(
                    "Для эскизов обязательны все размеры: ширина, высота и толщина."
                )
            if any(val <= 0 for val in [self.sketch_width_mm, self.sketch_height_mm, self.sketch_thickness_mm]):
                raise ValidationError(
                    "Размеры эскиза должны быть положительными числами."
                )
    estimated_print_time_minutes = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    moonraker_job_id = models.CharField(max_length=64, blank=True, null=True)
    last_error = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"PrintJob #{self.pk} ({self.status})"

class Surface(models.Model):
    """Поверхности модели для выбора параметров печати."""
    job = models.ForeignKey(PrintJob, on_delete=models.CASCADE, related_name="surfaces")
    name = models.CharField(max_length=100)
    index = models.PositiveIntegerField()
    selected = models.BooleanField(default=False)
    slot_assignment = models.PositiveSmallIntegerField(null=True, blank=True)

class SlotAssignment(models.Model):
    """Назначение материалов на слоты/части модели."""
    job = models.ForeignKey(PrintJob, on_delete=models.CASCADE, related_name="slot_assignments")
    slot_index = models.PositiveSmallIntegerField()
    material_preset = models.ForeignKey(MaterialPreset, on_delete=models.PROTECT)
    length_mm = models.FloatField(null=True, blank=True)
    mass_g = models.FloatField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["slot_index"]
        unique_together = [("job", "slot_index")]
