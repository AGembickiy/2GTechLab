from django.db import models


class SlotAssignment(models.Model):
    """Назначение материалов на слоты/части модели."""
    job = models.ForeignKey('PrintJob', on_delete=models.CASCADE, related_name='slot_assignments')
    slot_index = models.PositiveSmallIntegerField()
    material_preset = models.ForeignKey('MaterialPreset', on_delete=models.PROTECT)
    length_mm = models.FloatField(null=True, blank=True)
    mass_g = models.FloatField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["slot_index"]
        unique_together = [("job", "slot_index")]
