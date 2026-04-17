from django.test import TestCase
from django.contrib.auth.models import User
from print_service.models import MaterialPreset, PrintJob, Equipment, Material, EquipmentMaterial

class MaterialPresetModelTest(TestCase):
    """Тесты для модели MaterialPreset."""

    def setUp(self):
        self.material_preset = MaterialPreset.objects.create(
            name="PLA Синий",
            type="PLA",
            color_hex="#3b82f6",
            density_g_per_cm3=1.24,
            price_per_kg=820.00
        )

    def test_material_preset_creation(self):
        """Проверка создания экземпляра MaterialPreset."""
        self.assertEqual(self.material_preset.name, "PLA Синий")
        self.assertEqual(self.material_preset.type, "PLA")
        self.assertEqual(self.material_preset.color_hex, "#3b82f6")
        self.assertEqual(self.material_preset.density_g_per_cm3, 1.24)
        self.assertEqual(float(self.material_preset.price_per_kg), 820.00)

    def test_material_preset_string_representation(self):
        """Проверка строкового представления MaterialPreset."""
        self.assertEqual(str(self.material_preset), "PLA Синий (#3b82f6)")


class PrintJobModelTest(TestCase):
    """Тесты для модели PrintJob."""

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.print_job = PrintJob.objects.create(
            user=self.user,
            original_file='uploads/test_model.stl',
            status='draft'
        )

    def test_print_job_creation(self):
        """Проверка создания экземпляра PrintJob."""
        self.assertEqual(self.print_job.user.username, 'testuser')
        self.assertEqual(self.print_job.status, 'draft')
        self.assertEqual(self.print_job.upload_kind, 'model')

    def test_print_job_string_representation(self):
        """Проверка строкового представления PrintJob."""
        # Так как у нас нет pk до сохранения, используем другой способ
        # или создаем объект с известным pk, что не рекомендуется.
        # Просто проверим формат.
        self.assertIn('PrintJob', str(self.print_job))
        self.assertIn('draft', str(self.print_job))


class EquipmentModelTest(TestCase):
    """Тесты для модели Equipment."""

    def setUp(self):
        self.equipment = Equipment.objects.create(
            name="Prusa MK4",
            max_temp=300,
            build_volume_m3=0.012
        )

    def test_equipment_creation(self):
        """Проверка создания экземпляра Equipment."""
        self.assertEqual(self.equipment.name, "Prusa MK4")
        self.assertEqual(self.equipment.max_temp, 300)
        self.assertEqual(self.equipment.build_volume_m3, 0.012)

    def test_equipment_string_representation(self):
        """Проверка строкового представления Equipment."""
        self.assertEqual(str(self.equipment), "Prusa MK4")


class MaterialModelTest(TestCase):
    """Тесты для модели Material."""

    def setUp(self):
        self.material = Material.objects.create(
            name="PLA",
            temp_range_min=180,
            temp_range_max=220,
            color_hex="#FFFFFF"
        )

    def test_material_creation(self):
        """Проверка создания экземпляра Material."""
        self.assertEqual(self.material.name, "PLA")
        self.assertEqual(self.material.temp_range_min, 180)
        self.assertEqual(self.material.temp_range_max, 220)
        self.assertEqual(self.material.color_hex, "#FFFFFF")

    def test_material_string_representation(self):
        """Проверка строкового представления Material."""
        self.assertEqual(str(self.material), "PLA")


class EquipmentMaterialModelTest(TestCase):
    """Тесты для модели EquipmentMaterial."""

    def setUp(self):
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
        self.equipment_material = EquipmentMaterial.objects.create(
            equipment=self.equipment,
            material=self.material
        )

    def test_equipment_material_creation(self):
        """Проверка создания экземпляра EquipmentMaterial."""
        self.assertEqual(self.equipment_material.equipment, self.equipment)
        self.assertEqual(self.equipment_material.material, self.material)

    def test_equipment_material_unique_constraint(self):
        """Проверка уникальности пары equipment-material."""
        with self.assertRaises(Exception):
            EquipmentMaterial.objects.create(
                equipment=self.equipment,
                material=self.material
            )