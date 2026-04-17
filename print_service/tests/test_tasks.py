from django.test import TestCase
from unittest.mock import patch, MagicMock
from print_service.tasks.slicing import process_3d_model
from print_service.models import PrintJob

class Process3DModelTaskTest(TestCase):
    """Тесты для задачи Celery process_3d_model."""

    @patch('print_service.tasks.slicing.try_convert_to_stl')
    @patch('print_service.tasks.slicing.trimesh.load_mesh')
    @patch('print_service.tasks.slicing.subprocess.run')
    @patch('print_service.tasks.slicing.open', create=True)
    @patch('os.makedirs')
    def test_process_3d_model_success(self, mock_makedirs, mock_open, mock_subprocess_run, mock_load_mesh, mock_try_convert_to_stl):
        """Проверка успешного выполнения задачи."""
        # Создаем моки
        mock_try_convert_to_stl.return_value = (True, "")
        mock_mesh = MagicMock()
        mock_load_mesh.return_value = mock_mesh
        mock_subprocess_run.return_value = MagicMock(returncode=0)
        
        # Мокаем чтение gcode файла
        mock_file = MagicMock()
        mock_file.read.return_value = b"test gcode content"
        # Настраиваем mock_open так, чтобы он возвращал mock_file при вызове open()
        mock_open.return_value = mock_file

        # Создаем тестовое задание
        job = PrintJob.objects.create(
            original_file='uploads/test.stl',
            status='draft'
        )

        # Вызываем задачу
        result = process_3d_model.run(job.id)

        # Проверяем результат
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['job_id'], job.id)
        # Проверяем, что статус задания изменился
        job.refresh_from_db()
        self.assertEqual(job.status, 'ready')

    @patch('print_service.tasks.slicing.try_convert_to_stl')
    @patch('print_service.tasks.slicing.trimesh.load_mesh')
    @patch('print_service.tasks.slicing.subprocess.run')
    @patch('os.makedirs')
    def test_process_3d_model_slicing_error(self, mock_makedirs, mock_subprocess_run, mock_load_mesh, mock_try_convert_to_stl):
        """Проверка обработки ошибки нарезки."""
        mock_try_convert_to_stl.return_value = (True, "")
        mock_load_mesh.return_value = MagicMock()
        mock_subprocess_run.return_value = MagicMock(returncode=1, stderr="Ошибка CuraEngine")

        job = PrintJob.objects.create(
            original_file='uploads/test.stl',
            status='draft'
        )

        result = process_3d_model.run(job.id)

        self.assertEqual(result['status'], 'error')
        self.assertIn('Ошибка CuraEngine', result['error'])
        job.refresh_from_db()
        self.assertEqual(job.status, 'error')
        self.assertIn('Ошибка CuraEngine', job.last_error)

    @patch('print_service.tasks.slicing.try_convert_to_stl')
    def test_process_3d_model_conversion_error(self, mock_try_convert_to_stl):
        """Проверка обработки ошибки конвертации."""
        mock_try_convert_to_stl.return_value = (False, "Ошибка конвертации")

        job = PrintJob.objects.create(
            original_file='uploads/test.stl',
            status='draft'
        )

        result = process_3d_model.run(job.id)

        self.assertEqual(result['status'], 'error')
        self.assertIn('Ошибка конвертации', result['error'])
        job.refresh_from_db()
        self.assertEqual(job.status, 'error')
        self.assertIn('Ошибка конвертации', job.last_error)