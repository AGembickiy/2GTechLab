from django.contrib import admin
from backend.apps.printers.models.equipment import Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_temp', 'build_volume_m3', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)
