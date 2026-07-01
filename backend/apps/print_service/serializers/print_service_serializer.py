from rest_framework import serializers
from backend.apps.print_service.models.print_job import PrintJob
from backend.apps.print_service.models.material_preset import MaterialPreset
from backend.apps.print_service.models.slot_assignment import SlotAssignment
from backend.apps.print_service.models.surface import Surface


class MaterialPresetSerializer(serializers.ModelSerializer):
    """Сериализатор предустановки материала."""
    class Meta:
        model = MaterialPreset
        fields = ['id', 'name', 'type', 'color_hex', 'density_g_per_cm3', 'price_per_kg']
        read_only_fields = ['id']


class SlotAssignmentSerializer(serializers.ModelSerializer):
    """Сериализатор назначения слота."""
    material_preset_details = MaterialPresetSerializer(source='material_preset', read_only=True)

    class Meta:
        model = SlotAssignment
        fields = ['id', 'job', 'slot_index', 'material_preset', 'material_preset_details', 'length_mm', 'mass_g', 'cost']
        read_only_fields = ['id', 'job', 'cost']


class SurfaceSerializer(serializers.ModelSerializer):
    """Сериализатор поверхности модели."""
    class Meta:
        model = Surface
        fields = ['id', 'job', 'name', 'index', 'selected', 'slot_assignment']
        read_only_fields = ['id', 'job']


class PrintJobSerializer(serializers.ModelSerializer):
    """Сериализатор задания на печать."""
    slot_assignments = SlotAssignmentSerializer(many=True, read_only=True)
    surfaces = SurfaceSerializer(many=True, read_only=True)

    class Meta:
        model = PrintJob
        fields = [
            'id', 'user', 'original_file', 'converted_stl', 'converted_glb', 
            'converted_3mf', 'gcode_file', 'status', 'upload_kind', 
            'sketch_width_mm', 'sketch_height_mm', 'sketch_thickness_mm',
            'estimated_print_time_minutes', 'created_at', 'moonraker_job_id',
            'last_error', 'slot_assignments', 'surfaces'
        ]
        read_only_fields = [
            'id', 'user', 'converted_stl', 'converted_glb', 'converted_3mf',
            'gcode_file', 'status', 'estimated_print_time_minutes', 'created_at',
            'moonraker_job_id', 'last_error'
        ]
