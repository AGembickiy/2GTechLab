from django.db import models
from django.core.validators import MinValueValidator


class WarehouseItem(models.Model):
    """
    Элементы склада - материалы, расходники, оборудование.
    """
    ITEM_TYPE_MATERIAL = 'material'
    ITEM_TYPE_CONSUMABLE = 'consumable'
    ITEM_TYPE_EQUIPMENT = 'equipment'
    
    ITEM_TYPE_CHOICES = [
        (ITEM_TYPE_MATERIAL, 'Материал'),
        (ITEM_TYPE_CONSUMABLE, 'Расходник'),
        (ITEM_TYPE_EQUIPMENT, 'Оборудование'),
    ]
    
    name = models.CharField("Название", max_length=255)
    description = models.TextField("Описание", blank=True)
    item_type = models.CharField(
        "Тип",
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        default=ITEM_TYPE_MATERIAL
    )
    sku = models.CharField("Артикул", max_length=100, unique=True)
    quantity = models.IntegerField(
        "Количество",
        default=0,
        validators=[MinValueValidator(0)]
    )
    min_quantity = models.IntegerField(
        "Минимальный остаток",
        default=10,
        validators=[MinValueValidator(0)]
    )
    unit = models.CharField("Единица измерения", max_length=50, default="шт.")
    cost_price = models.DecimalField(
        "Себестоимость",
        max_digits=10,
        decimal_places=2,
        default=0
    )
    selling_price = models.DecimalField(
        "Цена продажи",
        max_digits=10,
        decimal_places=2,
        default=0
    )
    supplier = models.CharField("Поставщик", max_length=255, blank=True)
    location = models.CharField("Местоположение", max_length=100, blank=True)
    is_active = models.BooleanField("Активен", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Элемент склада'
        verbose_name_plural = 'Элементы склада'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['item_type']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.sku} - {self.name}"

    @property
    def is_low_stock(self) -> bool:
        return self.quantity <= self.min_quantity

    @property
    def is_out_of_stock(self) -> bool:
        return self.quantity == 0
