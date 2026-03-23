from rest_framework import serializers

from .models import MaterialPreset, PrintJob, SlotAssignment, Surface


class MaterialPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialPreset
        fields = [
            "id",
            "name",
            "type",
            "color_hex",
            "density_g_per_cm3",
            "price_per_kg",
        ]


class SlotAssignmentSerializer(serializers.ModelSerializer):
    material_preset = MaterialPresetSerializer(read_only=True)
    material_preset_id = serializers.PrimaryKeyRelatedField(
        queryset=MaterialPreset.objects.all(), source="material_preset", write_only=True
    )

    class Meta:
        model = SlotAssignment
        fields = [
            "id",
            "slot_index",
            "material_preset",
            "material_preset_id",
            "length_mm",
            "mass_g",
            "cost",
        ]


class SurfaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Surface
        fields = ["id", "name", "index", "selected", "slot_assignment"]


class PrintJobSerializer(serializers.ModelSerializer):
    slot_assignments = SlotAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = PrintJob
        fields = [
            "id",
            "status",
            "created_at",
            "original_file",
            "converted_stl",
            "gcode_file",
            "moonraker_job_id",
            "last_error",
            "slot_assignments",
        ]
        read_only_fields = [
            "status",
            "created_at",
            "converted_stl",
            "gcode_file",
            "moonraker_job_id",
            "last_error",
            "slot_assignments",
        ]


class PrintJobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintJob
        fields = ["original_file"]

    def create(self, validated_data):
        return PrintJob.objects.create(status="preview", **validated_data)


class SlotBulkAssignSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    slot_index = serializers.IntegerField(min_value=0, max_value=3)
    material_preset_id = serializers.IntegerField()
    surface_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
