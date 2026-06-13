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


class Printer(models.Model):
    """3D-принтеры."""
    name = models.CharField("Название", max_length=100)
    max_temperature = models.IntegerField("Максимальная температура (°C)", default=300)

    class Meta:
        verbose_name = 'Принтер'
        verbose_name_plural = 'Принтеры'

    def __str__(self):
        return self.name


class Order(models.Model):
    """Заказы."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField("Общая цена", max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f"Order #{self.pk}"
