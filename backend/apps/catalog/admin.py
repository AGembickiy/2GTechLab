from django.contrib import admin
from backend.apps.catalog.models.material import Material
from backend.apps.catalog.models.printer import Printer


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_per_gram')
    search_fields = ('name',)


@admin.register(Printer)
class PrinterAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_temperature')
    search_fields = ('name',)
