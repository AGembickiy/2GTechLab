from django.contrib import admin
from .models import Material, MaterialPreset


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'temp_range_min', 'temp_range_max', 'color_hex')
    search_fields = ('name',)
    list_filter = ('color_hex',)


@admin.register(MaterialPreset)
class MaterialPresetAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'color_hex', 'density_g_per_cm3', 'price_per_kg')
    search_fields = ('name', 'type')
    list_filter = ('type',)
