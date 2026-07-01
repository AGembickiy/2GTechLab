from django.contrib import admin
from backend.apps.print_service.models.material_preset import MaterialPreset
from backend.apps.print_service.models.print_job import PrintJob
from backend.apps.print_service.models.slot_assignment import SlotAssignment
from backend.apps.print_service.models.surface import Surface


@admin.register(MaterialPreset)
class MaterialPresetAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'color_hex', 'density_g_per_cm3', 'price_per_kg')
    search_fields = ('name', 'type')
    list_filter = ('type',)


@admin.register(PrintJob)
class PrintJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'upload_kind', 'created_at')
    list_filter = ('status', 'upload_kind', 'created_at')
    search_fields = ('id', 'user__username')
    readonly_fields = ['created_at']


@admin.register(SlotAssignment)
class SlotAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'slot_index', 'material_preset', 'cost')
    search_fields = ('job__id',)


@admin.register(Surface)
class SurfaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'name', 'index', 'selected', 'slot_assignment')
    search_fields = ('job__id',)
