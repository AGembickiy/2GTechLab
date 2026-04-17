from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from print_service.models import Equipment, Material

class DetectEquipmentViewTest(TestCase):
    """Тесты для DetectEquipmentView."""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('detect-equipment')
        # Создаем тестовое оборудование и материалы
        self.equipment = Equipment.objects.create(
            name="Prusa MK4",
            max_temp=300,
            build_volume_m3=0.012
        )
        self.material = Material.objects.create(
            name="PLA",
            temp_range_min=180,
            temp_range_max=220,
            color_hex="#FFFFFF"
        )
        # Связываем оборудование и материал
        self.equipment.materials.add(self.material)
        # Создаем тестовый STL файл
        self.stl_file = SimpleUploadedFile(
            "test_model.stl",
            b"solid test\nfacet normal 0 0 0\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid test",
            content_type="application/sla"
        )

    def test_detect_equipment_success(self):
        """Проверка успешного определения оборудования."""
        response = self.client.post(self.url, {'file': self.stl_file}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertIn('equipment', response.data)
        self.assertIn('palette', response.data)
        self.assertEqual(response.data['equipment']['name'], "Prusa MK4")
        self.assertEqual(len(response.data['palette']), 1)  # Ожидаем 1 материал
        self.assertEqual(response.data['palette'][0]['name'], "PLA")

    def test_detect_equipment_no_file(self):
        """Проверка отсутствия файла в запросе."""
        response = self.client.post(self.url, {}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Файл не передан')

    def test_detect_equipment_no_suitable_equipment(self):
        """Проверка отсутствия подходящего оборудования."""
        # Удаляем все оборудование
        Equipment.objects.all().delete()
        response = self.client.post(self.url, {'file': self.stl_file}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertIn('Нет оборудования', response.data['error'])