from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User


class Material(models.Model):
    """Материалы для 3D-печати (дубликат для совместимости, устаревшая модель)."""
    name = models.CharField("Название", max_length=100)
    price_per_gram = models.DecimalField("Цена за грамм", max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'Материал (устаревший)'
        verbose_name_plural = 'Материалы (устаревшие)'

    def __str__(self):
        return self.name


class Printer(models.Model):
    """3D-принтеры (дубликат для совместимости, устаревшая модель)."""
    name = models.CharField("Название", max_length=100)
    max_temperature = models.IntegerField("Максимальная температура (°C)")

    class Meta:
        verbose_name = 'Принтер (устаревший)'
        verbose_name_plural = 'Принтеры (устаревшие)'

    def __str__(self):
        return self.name


class Order(models.Model):
    """Заказы (дубликат для совместимости, устаревшая модель)."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField("Общая цена", max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'Заказ (устаревший)'
        verbose_name_plural = 'Заказы (устаревшие)'

    def __str__(self):
        return f"Order #{self.pk}"


class OrderParameter(models.Model):
    """Параметры заказа (дубликат для совместимости, устаревшая модель)."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='parameters')
    scale = models.FloatField(default=1.0)

    class Meta:
        verbose_name = 'Параметр заказа (устаревший)'
        verbose_name_plural = 'Параметры заказов (устаревшие)'
