from django.contrib.auth.models import User
from django.db import models


class MaterialPreset(models.Model):
    TYPE_CHOICES = [
        ("PLA", "PLA"),
        ("PETG", "PETG"),
        ("ABS", "ABS"),
        ("TPU", "TPU"),
    ]
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="PLA")
    color_hex = models.CharField(max_length=7)
    density_g_per_cm3 = models.FloatField(default=1.24)
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.name} ({self.color_hex})"


class PrintJob(models.Model):
    STATUS_CHOICES = [
        ("draft", "Черновик"),
        ("preview", "Предпросмотр"),
        ("slicing", "Слайсинг"),
        ("ready", "Готово"),
        ("ordered", "Заказано"),
        ("error", "Ошибка"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    original_file = models.FileField(upload_to="uploads/")
    converted_stl = models.FileField(upload_to="stl/", blank=True, null=True)
    gcode_file = models.FileField(upload_to="gcode/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    moonraker_job_id = models.CharField(max_length=64, blank=True, null=True)
    last_error = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"PrintJob #{self.pk} ({self.status})"


class Surface(models.Model):
    job = models.ForeignKey(PrintJob, on_delete=models.CASCADE, related_name="surfaces")
    name = models.CharField(max_length=100)
    index = models.PositiveIntegerField()
    selected = models.BooleanField(default=False)
    slot_assignment = models.PositiveSmallIntegerField(null=True, blank=True)


class SlotAssignment(models.Model):
    job = models.ForeignKey(PrintJob, on_delete=models.CASCADE, related_name="slot_assignments")
    slot_index = models.PositiveSmallIntegerField()
    material_preset = models.ForeignKey(MaterialPreset, on_delete=models.PROTECT)
    length_mm = models.FloatField(null=True, blank=True)
    mass_g = models.FloatField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["slot_index"]
        unique_together = [("job", "slot_index")]
