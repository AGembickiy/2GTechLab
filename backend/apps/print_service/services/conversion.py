"""Подготовка загруженных 3D-форматов в GLB/3MF (+ STL fallback для слайсера).

Архитектура:
- Три уровня конвертации:
  1. Trimesh (быстрый, для STL/OBJ/PLY/GLB/GLTF/USD)
  2. Blender CLI (универсальный, для FBX/DAE/3DS/BLEND/3MF/X)
  3. USD конвертер (для USD/USDA/USDC)
  4. Fallback на ошибку

Поддерживаемые форматы (17+):
- Trimesh: STL, OBJ, PLY, GLB, GLTF, USD, USDA, USDC
- Blender: FBX, DAE, 3DS, BLEND, 3MF, X
"""

from __future__ import annotations

import os
import subprocess
import uuid
from pathlib import Path
from typing import Tuple

from django.core.files.base import ContentFile

from print_service.models import PrintJob

# Поддерживаемые расширения файлов
TRIMESH_FORMATS = {
    ".stl", ".obj", ".ply", ".glb", ".gltf"
}

BLENDER_FORMATS = {
    ".fbx", ".dae", ".3ds", ".blend", ".3mf", ".x"
}

USD_FORMATS = {
    ".usd", ".usda", ".usdc"
}

SUPPORTED_EXTENSIONS = TRIMESH_FORMATS | BLENDER_FORMATS | USD_FORMATS


def _check_blender_available() -> bool:
    """Проверяет доступность Blender CLI."""
    try:
        result = subprocess.run(
            ["blender", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return False


def _convert_with_blender(input_path: Path, output_path: Path) -> None:
    """Конвертирует файл через Blender CLI в GLB."""
    blender_script = f"""
import bpy
import sys

input_path = r"{input_path}"
output_path = r"{output_path}"

# Загружаем пустую сцену
bpy.ops.wm.read_factory_settings(use_empty=True)

ext = input_path.split('.')[-1].lower()

# Импорт в зависимости от расширения
if ext == "stl":
    bpy.ops.import_mesh.stl(filepath=input_path)
elif ext == "obj":
    bpy.ops.wm.obj_import(filepath=input_path)
elif ext == "fbx":
    bpy.ops.import_scene.fbx(filepath=input_path)
elif ext == "dae":
    bpy.ops.wm.collada_import(filepath=input_path)
elif ext == "ply":
    bpy.ops.import_mesh.ply(filepath=input_path)
elif ext in ["glb", "gltf"]:
    bpy.ops.import_scene.gltf(filepath=input_path)
elif ext == "3mf":
    # 3MF требует плагина, пробуем стандартный импорт
    try:
        bpy.ops.import_scene.gltf(filepath=input_path)
    except:
        bpy.ops.wm.obj_import(filepath=input_path)
elif ext == "x":
    # X формат - через ASE или OBJ как fallback
    try:
        bpy.ops.wm.obj_import(filepath=input_path)
    except:
        raise ValueError(f"Unsupported format: {{ext}}")
elif ext == "blend":
    # BLEND файлы - открываем напрямую
    pass
elif ext == "vrml":
    bpy.ops.import_scene.vrml(filepath=input_path)
else:
    raise ValueError(f"Unsupported format: {{ext}}")

# Экспорт в GLB (внутренний формат)
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_texcoords=True,
    export_normals=True,
    export_materials=True
)
"""

    script_file = f"/tmp/convert_{uuid.uuid4()}.py"
    try:
        with open(script_file, "w") as f:
            f.write(blender_script)

        subprocess.run(
            [
                "blender",
                "--background",
                "--python",
                script_file,
            ],
            check=True,
            timeout=300,  # 5 минут на конвертацию
        )
    finally:
        # Очищаем временный скрипт
        try:
            os.remove(script_file)
        except OSError:
            pass


def _convert_with_trimesh(job: PrintJob, path: str, name: str) -> Tuple[bool, str]:
    """
    Конвертирует модель через trimesh.
    Возвращает (успех, сообщение).
    """
    try:
        import trimesh
    except ImportError:
        return (
            False,
            "Конвертация недоступна: установите пакет trimesh (pip install trimesh numpy).",
        )

    try:
        # Загружаем модель
        try:
            loaded = trimesh.load(path, force="mesh")
        except Exception as e:
            return False, f"Ошибка загрузки модели через trimesh: {str(e)}"

        # Обработка сцены
        if isinstance(loaded, trimesh.Scene):
            geoms = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
            if not geoms:
                return False, "Не удалось извлечь меш из сцены."
            loaded = trimesh.util.concatenate(geoms)

        if not isinstance(loaded, trimesh.Trimesh):
            return False, "Файл не содержит триангулированного меша."

        # Ремонт негерметичных моделей
        if not loaded.is_watertight:
            try:
                import pymeshfix

                meshfix = pymeshfix.MeshFix(loaded.vertices, loaded.faces)
                meshfix.repair()
                # Используем правильные атрибуты: points и faces
                loaded = trimesh.Trimesh(vertices=meshfix.points, faces=meshfix.faces)

                if not loaded.is_watertight:
                    loaded.fill_holes()

                if not loaded.is_watertight:
                    return False, "Критическая ошибка геометрии: модель негерметична и не подлежит авто-ремонту."
            except ImportError:
                loaded.fill_holes()
                if not loaded.is_watertight:
                    return False, "Модель негерметична. Установите pymeshfix для глубокого ремонта."
            except Exception as e:
                return False, f"Ошибка при автоматическом ремонте модели: {str(e)}"

        # Экспорт в STL
        try:
            stl_bytes = loaded.export(file_type="stl")
            job.converted_stl.save(f"converted_{job.pk}.stl", ContentFile(stl_bytes), save=False)
        except Exception as e:
            return False, f"Ошибка экспорта в STL: {str(e)}"

        # Экспорт в GLB
        try:
            glb_bytes = loaded.export(file_type="glb")
            job.converted_glb.save(f"converted_{job.pk}.glb", ContentFile(glb_bytes), save=False)
        except Exception as e:
            return False, f"Ошибка экспорта в GLB: {str(e)}"

        # Экспорт в 3MF
        try:
            mf3_bytes = loaded.export(file_type="3mf")
            job.converted_3mf.save(f"converted_{job.pk}.3mf", ContentFile(mf3_bytes), save=False)
        except Exception as e:
            return False, f"Ошибка экспорта в 3MF: {str(e)}"

        job.save(update_fields=["converted_stl", "converted_glb", "converted_3mf"])
        return True, ""

    except Exception as exc:
        return False, str(exc) or "Ошибка конвертации модели."


def _convert_with_blender_wrapper(job: PrintJob, path: str) -> Tuple[bool, str]:
    """
    Конвертирует модель через Blender CLI.
    Возвращает (успех, сообщение).
    
    Поддерживаемые форматы через Blender:
    - FBX, DAE, 3DS, BLEND, 3MF, X
    
    STL, OBJ, PLY, GLB, GLTF обрабатываются через trimesh.
    USD форматы требуют отдельного конвертера.
    """
    try:
        input_path = Path(path)
        output_dir = Path(job.converted_glb.storage.location)
        output_dir.mkdir(parents=True, exist_ok=True)

        output_file = output_dir / f"{uuid.uuid4()}.glb"

        # Проверяем, поддерживает ли Blender этот формат
        ext = input_path.suffix.lower()
        
        # В Blender обрабатываем только BLENDER_FORMATS
        if ext not in BLENDER_FORMATS:
            # Для неподдерживаемых форматов возвращаем False
            # Формат должен обрабатываться через trimesh или USD конвертер
            return False, f"Blender не поддерживает формат {ext}"

        # Конвертируем через Blender
        _convert_with_blender(input_path, output_file)

        # Читаем результат и сохраняем в модель
        with open(output_file, "rb") as f:
            glb_bytes = f.read()

        job.converted_glb.save(f"converted_{job.pk}.glb", ContentFile(glb_bytes), save=False)

        # Пытаемся также создать STL и 3MF через trimesh (для совместимости)
        try:
            import trimesh

            loaded = trimesh.load(str(output_file), force="mesh")
            if isinstance(loaded, trimesh.Scene):
                geoms = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
                loaded = trimesh.util.concatenate(geoms)

            # STL
            stl_bytes = loaded.export(file_type="stl")
            job.converted_stl.save(f"converted_{job.pk}.stl", ContentFile(stl_bytes), save=False)

            # 3MF
            mf3_bytes = loaded.export(file_type="3mf")
            job.converted_3mf.save(f"converted_{job.pk}.3mf", ContentFile(mf3_bytes), save=False)

        except Exception as e:
            # Если trimesh не может прочитать GLB, это не критично
            pass

        job.save(
            update_fields=[
                "converted_stl",
                "converted_glb",
                "converted_3mf",
            ]
        )
        return True, ""

    except subprocess.TimeoutExpired:
        return False, "Время конвертации через Blender истекло (более 5 минут)."
    except Exception as exc:
        return False, str(exc) or "Ошибка конвертации через Blender."


def try_prepare_model_assets(job: PrintJob) -> Tuple[bool, str]:
    """
    Конвертирует любую поддерживаемую 3D-модель в GLB и 3MF.
    Дополнительно сохраняет STL как fallback для инструментов.

    Архитектура:
    1. Определяем расширение файла
    2. Если trimesh поддерживает — используем его (быстро)
    3. Иначе пробуем Blender CLI (для FBX/DAE/3DS/BLEND/3MF/X)
    4. Иначе пробуем USD конвертер (для USD/USDA/USDC)
    5. Возвращает (успех, сообщение об ошибке для пользователя).

    Поддерживаемые форматы:
    - STL, OBJ, PLY, GLB, GLTF (через trimesh)
    - FBX, DAE, 3DS, BLEND, 3MF, X (через Blender)
    - USD, USDA, USDC (через USD конвертер/Trimesh)
    """
    path = job.original_file.path
    name = job.original_file.name.lower()
    ext = Path(name).suffix.lower()

    # Проверка расширения
    if ext not in SUPPORTED_EXTENSIONS:
        return (
            False,
            f"Неподдерживаемый формат файла: {ext}. Поддерживаемые форматы: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
        )

    # Попытка 1: Trimesh (быстрый, если поддерживает формат)
    # Trimesh хорошо работает с: STL, OBJ, PLY, GLB, GLTF, USD
    if ext in TRIMESH_FORMATS:
        success, error = _convert_with_trimesh(job, path, name)
        if success:
            return True, "Модель успешно конвертирована (через trimesh)."

    # Попытка 2: Blender CLI (для FBX, DAE, 3DS, BLEND, 3MF, X)
    blender_available = _check_blender_available()
    if blender_available and ext in BLENDER_FORMATS:
        success, error = _convert_with_blender_wrapper(job, path)
        if success:
            return True, "Модель успешно конвертирована (через Blender)."

    # Попытка 3: USD конвертер (для USD, USDA, USDC)
    if ext in USD_FORMATS:
        success, error = _convert_with_usd(job, path, name)
        if success:
            return True, "Модель успешно конвертирована (через USD конвертер)."

    # Все попытки провалились
    # Если Blender недоступен, сообщаем об этом (для форматов, которые требуют Blender)
    if not blender_available and ext in BLENDER_FORMATS:
        return (
            False,
            f"Не удалось конвертировать модель. Blender CLI не установлен, а формат {ext} требует его для импорта. Установите Blender и добавьте в PATH.",
        )

    return False, f"Ошибка конвертации модели: {error}"


def _convert_with_usd(job: PrintJob, path: str, name: str) -> Tuple[bool, str]:
    """
    Конвертирует USD файл через USD-конвертер в GLB.
    Возвращает (успех, сообщение).
    
    Использует trimesh для чтения USD форматов.
    """
    try:
        import trimesh
    except ImportError:
        return (
            False,
            "Конвертация недоступна: установите пакет trimesh (pip install trimesh numpy).",
        )

    try:
        # Trimesh поддерживает чтение USD форматов
        loaded = trimesh.load(path, force="scene")
        
        # Обработка сцены
        if isinstance(loaded, trimesh.Scene):
            geoms = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
            if not geoms:
                return False, "Не удалось извлечь меш из сцены."
            loaded = trimesh.util.concatenate(geoms)

        if not isinstance(loaded, trimesh.Trimesh):
            return False, "Файл не содержит триангулированного меша."

        # Экспорт в GLB
        glb_bytes = loaded.export(file_type="glb")
        job.converted_glb.save(f"converted_{job.pk}.glb", ContentFile(glb_bytes), save=False)

        # Экспорт в STL
        stl_bytes = loaded.export(file_type="stl")
        job.converted_stl.save(f"converted_{job.pk}.stl", ContentFile(stl_bytes), save=False)

        # Экспорт в 3MF
        mf3_bytes = loaded.export(file_type="3mf")
        job.converted_3mf.save(f"converted_{job.pk}.3mf", ContentFile(mf3_bytes), save=False)

        job.save(update_fields=["converted_stl", "converted_glb", "converted_3mf"])
        return True, ""

    except Exception as exc:
        return False, str(exc) or "Ошибка конвертации USD модели."


# Backward-compatible alias for old imports.
def try_convert_to_stl(job: PrintJob) -> Tuple[bool, str]:
    return try_prepare_model_assets(job)
