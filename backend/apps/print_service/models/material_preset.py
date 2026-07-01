from django.db import models


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
    color_hex = models.CharField(max_length=7, choices=COLOR_CHOICES, default="#FFFFFF")
    density_g_per_cm3 = models.FloatField(default=1.24)
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.name} ({self.color_hex})"
