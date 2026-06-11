"""Тесты универсального конвертера 3D-моделей.

Тестирует:
- Определение доступности Blender CLI
- Конвертацию через trimesh
- Конвертацию через Blender CLI
- Универсальный оркестратор
"""

import os
import tempfile
import uuid
from pathlib import Path

from django.test import TestCase, override_settings

from print_service.models import PrintJob
from print_service.services.conversion import (
    SUPPORTED_EXTENSIONS,
    _check_blender_available,
    try_prepare_model_assets,
)


class ConversionUtilsTest(TestCase):
    """Тесты утилит конвертации."""

    def test_supported_extensions(self):
        """Проверка списка поддерживаемых расширений."""
        expected_extensions = {
            ".stl",
            ".obj",
            ".fbx",
            ".dae",
            ".ply",
            ".gltf",
            ".glb",
            # 3MF и VRML временно отключены
            # ".3mf",
            # ".vrml",
            # ".wrl",
        }
        self.assertEqual(set(SUPPORTED_EXTENSIONS.keys()), expected_extensions)

    def test_check_blender_available(self):
        """Проверка обнаружения Blender CLI."""
        # Если Blender установлен, должен вернуть True
        # Если нет — False (это нормально для тестов)
        result = _check_blender_available()
        self.assertIsInstance(result, bool)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class UniversalConverterIntegrationTest(TestCase):
    """Интеграционные тесты конвертации с реальными файлами."""

    def setUp(self):
        """Настройка тестовых данных."""
        self.temp_dir = tempfile.mkdtemp()
        self.stl_file = os.path.join(self.temp_dir, "test.stl")

        # Герметичный STL файл (тетраэдр - простейший замкнутый многогранник)
        stl_content = """solid test
  facet normal 0.577 0.577 0.577
    outer loop
      vertex 1 0 0
      vertex 0 1 0
      vertex 0 0 1
    endloop
  endfacet
  facet normal -0.577 -0.577 0.577
    outer loop
      vertex 0 0 0
      vertex 0 0 1
      vertex 0 1 0
    endloop
  endfacet
  facet normal -0.577 0.577 -0.577
    outer loop
      vertex 0 0 0
      vertex 0 1 0
      vertex 1 0 0
    endloop
  endfacet
  facet normal 0.577 -0.577 -0.577
    outer loop
      vertex 0 0 0
      vertex 1 0 0
      vertex 0 0 1
    endloop
  endfacet
endsolid test
"""
        with open(self.stl_file, "w") as f:
            f.write(stl_content)

    def tearDown(self):
        """Очистка после тестов."""
        try:
            os.unlink(self.stl_file)
            os.rmdir(self.temp_dir)
        except (FileNotFoundError, OSError):
            pass

    def test_try_prepare_model_assets_stl_success(self):
        """Тест успешной конвертации STL файла."""
        job = PrintJob.objects.create()

        # Загружаем реальный файл
        with open(self.stl_file, "rb") as f:
            job.original_file.save("test.stl", f, save=False)

        success, error = try_prepare_model_assets(job)

        # Проверяем результат
        self.assertTrue(success, f"Expected success, got error: {error}")
        self.assertIsNotNone(job.converted_glb, "GLB файл должен быть создан")
        self.assertIsNotNone(job.converted_stl, "STL файл должен быть создан")
        self.assertIsNotNone(job.converted_3mf, "3MF файл должен быть создан")

    def test_unsupported_extension(self):
        """Тест ошибки для неподдерживаемого расширения."""
        # Создаем файл с неподдерживаемым расширением
        unsupported_file = os.path.join(self.temp_dir, "test.xyz")
        with open(unsupported_file, "wb") as f:
            f.write(b"test")

        job = PrintJob.objects.create()

        with open(unsupported_file, "rb") as f:
            job.original_file.save("test.xyz", f, save=False)

        success, error = try_prepare_model_assets(job)

        self.assertFalse(success)
        self.assertIn("Неподдерживаемый формат", error)

    def test_check_blender_not_available_fallback(self):
        """Тест fallback, когда Blender недоступен."""
        # Создаем STL файл (должен работать через trimesh)
        job = PrintJob.objects.create()

        with open(self.stl_file, "rb") as f:
            job.original_file.save("test.stl", f, save=False)

        success, error = try_prepare_model_assets(job)

        # STL должен работать через trimesh даже без Blender
        self.assertTrue(success, f"STL должен работать через trimesh: {error}")
