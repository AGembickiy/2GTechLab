from django.db import models


class Material(models.Model):
    """Материалы для 3D-печати."""
    name = models.CharField("Название", max_length=100)
    price_per_gram = models.DecimalField("Цена за грамм", max_digits=10, decimal_places=2, default=0.01)

    class Meta:
        verbose_name = 'Материал'
        verbose_name_plural = 'Материалы'

    def __str__(self):
        return self.name
