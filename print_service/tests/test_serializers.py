from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from print_service.models import MaterialPreset, PrintJob, Surface
from print_service.serializers import (
    MaterialPresetSerializer,
    PrintJobSerializer,
    SliceJobSerializer,
)

class SliceJobSerializerTest(TestCase):
    def setUp(self):
        self.material_preset = MaterialPreset.objects.create(name="Test Material", price_per_kg=1000)
        self.print_job = PrintJob.objects.create(
            upload_kind='model',
            original_file=SimpleUploadedFile("test.stl", b"content")
        )
        self.valid_data = {
            "assignments": [
                {
                    "slot_index": 1,
                    "material_preset_id": self.material_preset.id,
                    "surface_ids": ["surface_1"]
                }
            ],
            "dimensions": {
                "width_mm": 10.0,
                "height_mm": 20.0,
                "thickness_mm": 5.0
            }
        }
        self.serializer = SliceJobSerializer(data=self.valid_data, context={'job': self.print_job})

    def test_serializer_with_valid_data(self):
        """Проверка сериализатора с валидными данными."""
        self.assertTrue(self.serializer.is_valid())
        self.assertEqual(len(self.serializer.validated_data['assignments']), 1)

    def test_serializer_with_invalid_material_id(self):
        """Проверка сериализатора с несуществующим material_preset_id."""
        data = self.valid_data.copy()
        data['assignments'][0]['material_preset_id'] = 999  # Несуществующий ID
        serializer = SliceJobSerializer(data=data, context={'job': self.print_job})
        self.assertFalse(serializer.is_valid())
        self.assertIn('assignments', serializer.errors)

    def test_serializer_missing_dimensions_for_sketch(self):
        """Проверка, что dimensions обязательны для эскизов."""
        # Изменяем тип задания на эскиз
        self.print_job.upload_kind = 'sketch'
        self.print_job.save()
        # Удаляем dimensions
        data = self.valid_data.copy()
        del data['dimensions']
        serializer = SliceJobSerializer(data=data, context={'job': self.print_job})
        self.assertFalse(serializer.is_valid())
        self.assertIn('dimensions', serializer.errors)