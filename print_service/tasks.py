from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from print_service.models import PrintJob
import trimesh
import subprocess
import os
from django.conf import settings
from django.core.files.base import ContentFile

@shared_task
def process_order(order_id):
    """
    Celery задача для обработки заказа на печать.
    Выполняет конвертацию модели в 3MF, нарезку через CuraEngine и расчет стоимости.
    """
    try:
        # Загрузка заказа
        order = PrintJob.objects.get(pk=order_id)
        
        # Устанавливаем статус обработки
        order.status = 'slicing'
        order.save()

        # Конвертация в 3MF
        # Используем оригинальный файл или конвертированный STL
        input_path = order.converted_stl.path if order.converted_stl else order.original_file.path
        
        # Создаем директорию для временных файлов
        tmp_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
        os.makedirs(tmp_dir, exist_ok=True)
        
        # Путь для 3MF файла
        three_mf_path = os.path.join(tmp_dir, f'model_{order_id}.3mf')
        
        # Загрузка модели
        mesh = trimesh.load(input_path)
        
        # Экспорт в 3MF
        mesh.export(three_mf_path, file_type='3mf')
        
        # Нарезка через CuraEngine
        # Путь к профилю печати
        profile_path = os.path.join(settings.BASE_DIR, 'profiles', 'default.def.json')
        
        # Путь для G-code
        gcode_path = os.path.join(tmp_dir, f'model_{order_id}.gcode')
        
        # Команда для CuraEngine
        cmd = [
            'CuraEngine',
            'slice',
            '-j', profile_path,
            '-l', three_mf_path,
            '-o', gcode_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            order.status = 'error'
            order.last_error = f"Ошибка нарезки: {result.stderr}"
            order.save()
            return {'status': 'error', 'error': result.stderr}

        # Расчет цены (упрощенный)
        # В реальности нужно использовать данные из слайсера
        # и назначения материалов
        total_cost = 0
        for assignment in order.slot_assignments.all():
            # Пример расчета: стоимость = масса * цена_за_кг
            if assignment.mass_g and assignment.material_preset:
                cost = (assignment.mass_g / 1000) * float(assignment.material_preset.price_per_kg)
                assignment.cost = round(cost, 2)
                assignment.save()
                total_cost += assignment.cost

        # Сохранение G-code в модель
        if os.path.exists(gcode_path):
            with open(gcode_path, 'rb') as gcode_file:
                order.gcode_file.save(f'model_{order_id}.gcode', ContentFile(gcode_file.read()), save=False)
        
        # Обновление статуса
        order.status = 'ready'
        order.save()
        
        # Удаляем временные файлы
        try:
            os.remove(three_mf_path)
            os.remove(gcode_path)
        except OSError:
            pass  # Игнорируем ошибки удаления
        
        return {
            'status': 'success', 
            'order_id': order_id, 
            'gcode_path': gcode_path,
            'total_cost': total_cost
        }
        
    except ObjectDoesNotExist:
        return {'status': 'error', 'error': f'PrintJob с id={order_id} не найден'}
    except Exception as e:
        # Логирование ошибки можно добавить здесь
        if 'order' in locals():
            order.status = 'error'
            order.last_error = str(e)
            order.save()
        return {'status': 'error', 'error': str(e)}
