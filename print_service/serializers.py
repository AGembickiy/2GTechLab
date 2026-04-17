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
        extra_kwargs = {
            'price_per_kg': {'min_value': 0},
            'density_g_per_cm3': {'min_value': 0.01},
        }

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
            "upload_kind",
            "sketch_width_mm",
            "sketch_height_mm",
            "sketch_thickness_mm",
            "estimated_print_time_minutes",
            "created_at",
            "original_file",
            "converted_stl",
            "converted_glb",
            "converted_3mf",
            "gcode_file",
            "moonraker_job_id",
            "last_error",
            "slot_assignments",
        ]
        read_only_fields = [
            "status",
            "upload_kind",
            "sketch_width_mm",
            "sketch_height_mm",
            "sketch_thickness_mm",
            "estimated_print_time_minutes",
            "created_at",
            "converted_stl",
            "converted_glb",
            "converted_3mf",
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
    slot_index = serializers.IntegerField(min_value=1, max_value=4)
    material_preset_id = serializers.IntegerField()
    surface_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)

class SliceAssignmentSerializer(serializers.Serializer):
    slot_index = serializers.IntegerField(min_value=1, max_value=4)
    material_preset_id = serializers.IntegerField()
    surface_ids = serializers.ListField(child=serializers.CharField(allow_blank=False), required=False, default=list)

class DimensionsSerializer(serializers.Serializer):
    width_mm = serializers.FloatField(min_value=0.1)
    height_mm = serializers.FloatField(min_value=0.1)
    thickness_mm = serializers.FloatField(min_value=0.1)

    def validate(self, attrs):
        # Проверка, что все поля присутствуют
        required_fields = ["width_mm", "height_mm", "thickness_mm"]
        for field in required_fields:
            if field not in attrs:
                raise serializers.ValidationError({field: "Обязательное поле."})
        return attrs

class SliceJobSerializer(serializers.Serializer):
    """Тело POST /print-jobs/:id/slice/ — назначения и размеры эскиза."""
    assignments = SliceAssignmentSerializer(many=True, required=False, default=list)
    dimensions = DimensionsSerializer(required=False, allow_null=True)

    def validate(self, attrs):
        job = self.context.get("job")
        if not job:
            return attrs
        
        if job.upload_kind == "sketch" and not attrs.get("dimensions"):
            raise serializers.ValidationError(
                {"dimensions": "Укажите размеры эскиза (width_mm, height_mm, thickness_mm)."}
            )
            
        # Проверка существования material_preset_id
        for assignment in attrs.get("assignments", []):
            material_id = assignment.get("material_preset_id")
            if material_id:
                if not MaterialPreset.objects.filter(id=material_id).exists():
                    raise serializers.ValidationError(
                        {"assignments": f"Материал с ID {material_id} не существует."}
                    )
                    
        return attrs
