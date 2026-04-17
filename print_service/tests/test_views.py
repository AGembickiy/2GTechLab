import json

from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch

from print_service.models import PrintJob, MaterialPreset, SlotAssignment, Surface

class UploadViewTest(TestCase):
    """Тесты для UploadView."""

    def setUp(self):
        self.client = Client()
        self.upload_url = reverse('upload')
        # Создаем тестовый STL файл
        self.stl_file = SimpleUploadedFile(
            "test_model.stl",
            b"solid test\nfacet normal 0 0 0\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid test",
            content_type="application/sla"
        )

    def test_upload_valid_stl(self):
        """Проверка загрузки валидного STL файла."""
        response = self.client.post(self.upload_url, {'file': self.stl_file}, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertIn('job_id', response.data)
        self.assertEqual(response.data['is_3d'], True)
        self.assertEqual(response.data['status'], 'preview')
        # Проверка создания объекта в БД
        self.assertTrue(PrintJob.objects.filter(id=response.data['job_id']).exists())

    def test_upload_invalid_format(self):
        """Проверка загрузки файла с недопустимым расширением."""
        invalid_file = SimpleUploadedFile(
            "test.txt",
            b"This is a text file.",
            content_type="text/plain"
        )
        response = self.client.post(self.upload_url, {'file': invalid_file}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('detail', response.data)
        self.assertIn('Неподдерживаемый формат', response.data['detail'])

    def test_upload_missing_file(self):
        """Проверка отсутствия файла в запросе."""
        response = self.client.post(self.upload_url, {}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Файл не отправлен')


class PrintJobResultViewTest(TestCase):
    """Тесты для PrintJobResultView."""

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.print_job = PrintJob.objects.create(
            user=self.user,
            original_file='uploads/test_model.stl',
            status='ready'
        )
        # Создаем связанные назначения для расчета стоимости
        self.material_preset = MaterialPreset.objects.create(
            name="PLA Синий",
            type="PLA",
            color_hex="#3b82f6",
            density_g_per_cm3=1.24,
            price_per_kg=820.00
        )
        self.print_job.slot_assignments.create(
            slot_index=1,
            material_preset=self.material_preset,
            cost=100.00
        )
        self.result_url = reverse('print-job-result', kwargs={'pk': self.print_job.pk})

    def test_get_ready_job(self):
        """Проверка получения результата для готового задания."""
        response = self.client.get(self.result_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['ready'], True)
        self.assertEqual(response.data['status'], 'ready')
        self.assertEqual(response.data['total_cost'], 100.0)
        self.assertEqual(len(response.data['slots']), 1)

    def test_get_slicing_job(self):
        """Проверка получения результата для задания в процессе нарезки."""
        self.print_job.status = 'slicing'
        self.print_job.save()
        response = self.client.get(self.result_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['ready'], False)
        self.assertEqual(response.data['status'], 'slicing')

    def test_get_nonexistent_job(self):
        """Проверка получения результата для несуществующего задания."""
        nonexistent_url = reverse('print-job-result', kwargs={'pk': 999})
        response = self.client.get(nonexistent_url)
        self.assertEqual(response.status_code, 404)


class PrintJobViewSetTest(TestCase):
    """Тесты для PrintJobViewSet."""

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.login(username='testuser', password='testpass')
        self.print_job = PrintJob.objects.create(
            user=self.user,
            original_file='uploads/test_model.stl',
            status='preview'
        )
        self.slice_url = reverse('print-job-slice', kwargs={'pk': self.print_job.pk})

    def test_slice_action(self):
        """Проверка действия slice в PrintJobViewSet."""
        # Устанавливаем статус в 'preview' для успешного запуска
        self.print_job.status = 'preview'
        self.print_job.save()
        response = self.client.post(self.slice_url, {}, format='json')
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.data['status'], 'slicing_started')
        # Проверка, что статус задания изменился
        self.print_job.refresh_from_db()
        self.assertEqual(self.print_job.status, 'slicing')

    @patch('print_service.views.process_3d_model.delay')
    def test_slice_saves_assignments_and_surfaces(self, mock_delay):
        """Проверка сохранения assignments и surface_ids при запуске slice."""
        material = MaterialPreset.objects.create(
            name="PLA White",
            type="PLA",
            color_hex="#FFFFFF",
            density_g_per_cm3=1.24,
            price_per_kg=1000.00
        )
        payload = {
            "assignments": [
                {
                    "slot_index": 1,
                    "material_preset_id": material.id,
                    "surface_ids": ["polygon_10", "polygon_11"],
                }
            ]
        }

        response = self.client.post(self.slice_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.data['status'], 'slicing_started')

        self.assertEqual(SlotAssignment.objects.filter(job=self.print_job).count(), 1)
        assignment = SlotAssignment.objects.get(job=self.print_job, slot_index=1)
        self.assertEqual(assignment.material_preset_id, material.id)

        surfaces = Surface.objects.filter(job=self.print_job).order_by('name')
        self.assertEqual(surfaces.count(), 2)
        self.assertEqual(list(surfaces.values_list('name', flat=True)), ['polygon_10', 'polygon_11'])
        self.assertTrue(all(s.selected for s in surfaces))
        self.assertTrue(all(s.slot_assignment == 1 for s in surfaces))

        mock_delay.assert_called_once_with(self.print_job.id)


class ConvertToGlbViewTest(TestCase):
    """Тесты для endpoint конвертации 3D модели в GLB."""

    def setUp(self):
        self.client = Client()
        self.url = reverse('convert-to-glb')
        self.stl_file = SimpleUploadedFile(
            "demo.stl",
            (
                b"solid demo\n"
                b"facet normal 0 0 1\n"
                b" outer loop\n"
                b"  vertex 0 0 0\n"
                b"  vertex 1 0 0\n"
                b"  vertex 0 1 0\n"
                b" endloop\n"
                b"endfacet\n"
                b"endsolid demo\n"
            ),
            content_type="application/sla",
        )

    def test_convert_to_glb_success(self):
        """Проверка успешной конвертации STL в GLB."""
        response = self.client.post(self.url, {'file': self.stl_file}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'model/gltf-binary')
        self.assertIn('attachment; filename="demo.glb"', response['Content-Disposition'])
        self.assertGreater(len(response.content), 0)