from django.db import models


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
