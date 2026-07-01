from django.db import models


class Surface(models.Model):
    """Поверхности модели для выбора параметров печати."""
    job = models.ForeignKey('PrintJob', on_delete=models.CASCADE, related_name='surfaces')
    name = models.CharField(max_length=100)
    index = models.PositiveIntegerField()
    selected = models.BooleanField(default=False)
    slot_assignment = models.PositiveSmallIntegerField(null=True, blank=True)
