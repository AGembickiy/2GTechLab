"""Подготовка загруженных 3D-форматов в GLB/3MF (+ STL fallback для слайсера)."""

from __future__ import annotations

from typing import Tuple

from django.core.files.base import ContentFile

from print_service.models import PrintJob


def try_prepare_model_assets(job: PrintJob) -> Tuple[bool, str]:
    """
    Конвертирует любую поддерживаемую 3D-модель в GLB и 3MF.
    Дополнительно сохраняет STL как fallback для инструментов, которым он нужен.
    Также пытается автоматически исправить негерметичные модели.
    Возвращает (успех, сообщение об ошибке для пользователя).
    """
    path = job.original_file.path
    name = job.original_file.name.lower()
    try:
        import trimesh
    except ImportError:
        return (
            False,
            "Конвертация в STL недоступна: установите пакет trimesh (pip install trimesh numpy).",
        )

    try:
        # Загружаем модель с помощью trimesh
        try:
            loaded = trimesh.load(path, force="mesh")
        except Exception as e:
            return False, f"Ошибка загрузки модели: {str(e)}"

        # Обработка сцены
        if isinstance(loaded, trimesh.Scene):
            geoms = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
            if not geoms:
                return False, "Не удалось извлечь меш из сцены."
            # Объединяем все мешы в сцене
            loaded = trimesh.util.concatenate(geoms)
        
        # Убедимся, что у нас есть Trimesh
        if not isinstance(loaded, trimesh.Trimesh):
            return False, "Файл не содержит триангулированного меша."

        # Проверка на герметичность (водонепроницаемость)
        if not loaded.is_watertight:
            # Попытка автоматического ремонта с помощью pymeshfix
            try:
                import pymeshfix
                # Создаем копию меша для ремонта
                meshfix = pymeshfix.MeshFix(loaded.vertices, loaded.faces)
                meshfix.repair()
                # Создаем новый trimesh из исправленных вершин и граней
                loaded = trimesh.Trimesh(vertices=meshfix.v, faces=meshfix.f)
                
                # Если все еще не герметично, пробуем trimesh fill_holes
                if not loaded.is_watertight:
                    loaded.fill_holes()
                
                # Повторная проверка
                if not loaded.is_watertight:
                    # Если модель критически повреждена, ставим статус ошибки (согласно ТЗ)
                    return False, "Критическая ошибка геометрии: модель негерметична и не подлежит авто-ремонту."
            except ImportError:
                # Если pymeshfix нет, пробуем хотя бы встроенный trimesh
                loaded.fill_holes()
                if not loaded.is_watertight:
                    return False, "Модель негерметична. Установите pymeshfix для глубокого ремонта."
            except Exception as e:
                return False, f"Ошибка при автоматическом ремонте модели: {str(e)}"

        # Экспортируем в STL как fallback
        try:
            stl_bytes = loaded.export(file_type="stl")
        except Exception as e:
            return False, f"Ошибка экспорта в STL: {str(e)}"
        job.converted_stl.save(f"converted_{job.pk}.stl", ContentFile(stl_bytes), save=False)

        # Экспортируем в GLB (двоичный glTF) для предпросмотра
        try:
            glb_bytes = loaded.export(file_type="glb")
            job.converted_glb.save(f"converted_{job.pk}.glb", ContentFile(glb_bytes), save=False)
        except Exception as e:
            return False, f"Ошибка экспорта в GLB: {str(e)}"

        # Экспортируем в 3MF для передачи инструкций по материалам/цветам в слайсер.
        # Назначения по поверхностям хранятся в SlotAssignment и применяются на этапе slicing.
        try:
            mf3_bytes = loaded.export(file_type="3mf")
            job.converted_3mf.save(f"converted_{job.pk}.3mf", ContentFile(mf3_bytes), save=False)
        except Exception as e:
            return False, f"Ошибка экспорта в 3MF: {str(e)}"

        job.save(update_fields=["converted_stl", "converted_glb", "converted_3mf"])
        return True, ""
    except Exception as exc:
        return False, str(exc) or "Ошибка конвертации модели."


# Backward-compatible alias for old imports.
def try_convert_to_stl(job: PrintJob) -> Tuple[bool, str]:
    return try_prepare_model_assets(job)
