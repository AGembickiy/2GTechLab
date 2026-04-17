from django.db import models

class Material(models.Model):
    name = models.CharField(max_length=100)
    price_per_gram = models.DecimalField(max_digits=10, decimal_places=2)
    # Остальные поля из спецификации

class Printer(models.Model):
    name = models.CharField(max_length=100)
    max_temperature = models.IntegerField()
    # Остальные поля

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    # Связи с материалами, принтерами и пользователями