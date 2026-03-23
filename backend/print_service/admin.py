from django.contrib import admin

from .models import MaterialPreset, PrintJob, SlotAssignment, Surface


@admin.register(MaterialPreset)
class MaterialPresetAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "type", "color_hex", "price_per_kg")


@admin.register(PrintJob)
class PrintJobAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "created_at", "user", "moonraker_job_id")


@admin.register(SlotAssignment)
class SlotAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "job", "slot_index", "material_preset", "mass_g", "cost")


@admin.register(Surface)
class SurfaceAdmin(admin.ModelAdmin):
    list_display = ("id", "job", "name", "index", "slot_assignment")
