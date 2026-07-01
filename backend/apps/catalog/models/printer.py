from django.db import models


class Printer(models.Model):
    """3D-принтеры."""
    name = models.CharField("Название", max_length=100)
    max_temperature = models.IntegerField("Максимальная температура (°C)", default=300)

    class Meta:
        verbose_name = 'Принтер'
        verbose_name_plural = 'Принтеры'

    def __str__(self):
        return self.name
