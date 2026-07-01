from django.contrib.auth.models import User
from django.db import models

from backend.apps.print_service.validators import validate_file_size, validate_3d_file, validate_2d_file


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
