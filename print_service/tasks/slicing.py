"""
Задачи Celery для обработки 3D-моделей.
"""

from decimal import Decimal
import logging
import os
import tempfile
from celery import shared_task
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import models
from print_service.models import PrintJob, SlotAssignment
from print_service.services.conversion import try_prepare_model_assets
import trimesh
import subprocess
import json

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_3d_model(self, job_id):
    """
    Асинхронная задача для обработки 3D-модели: конвертация, нарезка и расчет.
    """
    try:
        job = PrintJob.objects.get(id=job_id)
        job.status = 'slicing'
        job.save()

        # 1. Автоматический Ремонт и Подготовка
        success, error = try_prepare_model_assets(job)
        if not success:
            job.status = 'error'
            job.last_error = f"Ошибка подготовки модели: {error}"
            job.save()
            return {'status': 'error', 'error': error}

        # 2. Генерация 3MF с цветами (для цветной печати)
        stl_path = job.converted_stl.path if job.converted_stl else job.original_file.path
        three_mf_path = os.path.join(settings.MEDIA_ROOT, '3mf', f'model_{job_id}.3mf')
        os.makedirs(os.path.dirname(three_mf_path), exist_ok=True)
        
        # Загрузка модели
        mesh = trimesh.load_mesh(stl_path)
        
        # Применение цветов из SlotAssignment
        # (Упрощенная реализация, реальная требует работы с 3MF)
        # Для демонстрации просто сохраняем как есть
        mesh.export(three_mf_path, file_type='3mf')
        
        # 3. Вызов CuraEngine для нарезки
        gcode_path = os.path.join(settings.MEDIA_ROOT, 'gcode', f'model_{job_id}.gcode')
        os.makedirs(os.path.dirname(gcode_path), exist_ok=True)
        
        # Путь к профилю печати (должен быть настроен)
        profile_path = os.path.join(settings.BASE_DIR, 'profiles', 'default.def.json')
        
        # Команда для CuraEngine
        model_for_slicing = job.converted_3mf.path if job.converted_3mf else three_mf_path
        cmd = [
            'CuraEngine',
            'slice',
            '-j', profile_path,
            '-l', model_for_slicing,
            '-o', gcode_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            job.status = 'error'
            job.last_error = f"Ошибка нарезки: {result.stderr}"
            job.save()
            return {'status': 'error', 'error': result.stderr}

        # 4. Извлечение статистики из G-code (время и суммарная масса)
        total_weight_g = 0.0
        try:
            from orders.tasks import parse_gcode_stats
            stats = parse_gcode_stats(gcode_path)
            job.estimated_print_time_minutes = stats['time']
            total_weight_g = float(stats.get('weight') or 0.0)
        except Exception as e:
            logger.error(f"Ошибка при извлечении статистики из G-code: {e}")
            job.estimated_print_time_minutes = 60
        
        # 5. Расчет расхода и стоимости по слотам
        total_cost = 0
        assignments = list(job.slot_assignments.select_related("material_preset").all())
        slots_count = len(assignments)

        # Распределяем массу по доле реальных surface_ids (polygon_*) в каждом слоте.
        # Если surface-данных нет, используем равномерное распределение как fallback.
        surface_count_by_slot = {
            row["slot_assignment"]: row["count"]
            for row in job.surfaces.filter(selected=True, slot_assignment__isnull=False)
            .values("slot_assignment")
            .annotate(count=models.Count("id"))
        }
        total_surface_count = sum(surface_count_by_slot.values())
        default_mass_per_slot = (total_weight_g / slots_count) if slots_count > 0 else 0.0

        for assignment in assignments:
            if total_weight_g > 0:
                if total_surface_count > 0:
                    slot_surface_count = surface_count_by_slot.get(assignment.slot_index, 0)
                    slot_share = slot_surface_count / total_surface_count
                    assignment.mass_g = round(total_weight_g * slot_share, 3)
                elif default_mass_per_slot > 0:
                    assignment.mass_g = round(default_mass_per_slot, 3)

            # Расчет на основе массы (если есть) или фиксированный
            if assignment.mass_g and assignment.material_preset:
                price_per_g = float(assignment.material_preset.price_per_kg) / 1000
                assignment.cost = round(Decimal(assignment.mass_g * price_per_g), 2)
            else:
                # Заглушка если масса не определена
                assignment.cost = Decimal("150.00")
            assignment.save()
            total_cost += assignment.cost or 0
        
        # 6. Сохранение результатов
        with open(gcode_path, 'rb') as gcode_stream:
            job.gcode_file.save(f'model_{job_id}.gcode', ContentFile(gcode_stream.read()), save=True)
        job.status = 'ready'
        job.save()
        
        return {'status': 'success', 'job_id': job_id, 'gcode_path': gcode_path}
    
    except Exception as exc:
        job.status = 'error'
        job.last_error = str(exc)
        job.save()
        raise self.retry(exc=exc, countdown=60, max_retries=3)
