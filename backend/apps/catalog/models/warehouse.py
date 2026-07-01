from django.db import models


class WarehouseItemCategory(models.TextChoices):
    """Категории складских товаров."""
    FILAMENT = "filament", "Филамент"
    CONSUMABLE = "consumable", "Расходники"
    PACKAGING = "packaging", "Упаковка"


class WarehouseItem(models.Model):
    """Складские товары для 3D-печати."""
    name = models.CharField("Название", max_length=255)
    category = models.CharField(
        "Категория",
        max_length=30,
        choices=WarehouseItemCategory.choices
    )
    color = models.CharField("Цвет", max_length=50)
    density = models.FloatField("Плотность (г/см³)")
    length = models.FloatField("Длина (м)")
    quantity_in_stock = models.FloatField("Количество на складе")
    min_threshold = models.FloatField("Минимальный порог")
    price_per_unit = models.DecimalField(
        "Цена за единицу",
        max_digits=12,
        decimal_places=2
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Складской товар'
        verbose_name_plural = 'Складские товары'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.color}"

    @property
    def is_low_stock(self) -> bool:
        """Проверка на низкий остаток."""
        return self.quantity_in_stock <= self.min_threshold

    def update_stock(self, amount: float) -> None:
        """Обновление количества на складе."""
        self.quantity_in_stock += amount
        self.save()
