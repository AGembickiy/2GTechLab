import trimesh
import os
import subprocess
import re
import logging
import json
from celery import shared_task
from django.core.files.base import ContentFile
from .models import Order

logger = logging.getLogger(__name__)

def convert_to_glb(input_path):
    """Конвертирует входной файл в GLB с использованием trimesh"""
    try:
        mesh = trimesh.load(input_path)
        glb_path = input_path.rsplit('.', 1)[0] + '.glb'
        mesh.export(glb_path, file_type='glb')
        logger.info(f"Конвертация {input_path} в GLB прошла успешно")
        print(f"SUCCESS: Converted {input_path} to GLB")
        return glb_path
    except Exception as e:
        logger.error(f"Ошибка конвертации в GLB: {e}")
        print(f"ERROR: Failed to convert {input_path} to GLB: {e}")
        return input_path

def parse_gcode_stats(gcode_path):
    """Парсит G-code файл для извлечения статистики (время, вес)"""
    stats = {'time': 60, 'weight': 10.0}  # Значения по умолчанию
    
    try:
        with open(gcode_path, 'r') as f:
            content = f.read()
            
        # Извлечение времени печати из комментариев Cura
        time_match = re.search(r';TIME:([\d.]+)', content)
        if time_match:
            stats['time'] = int(float(time_match.group(1)) / 60)  # в минутах
        
        # Извлечение массы из комментариев Cura
        # Cura Engine не всегда добавляет массу, поэтому используем объем и плотность
        volume_match = re.search(r';Filament used: ([\d.]+)mm3', content)
        if volume_match:
            volume_cm3 = float(volume_match.group(1)) / 1000  # mm3 -> cm3
            # Средняя плотность PLA ~1.24 г/см3
            stats['weight'] = volume_cm3 * 1.24
        else:
            # Резервный расчет через объем модели
            try:
                # Загружаем модель из временного STL
                temp_stl = gcode_path.replace('.gcode', '.stl')
                if os.path.exists(temp_stl):
                    mesh = trimesh.load(temp_stl)
                    volume_cm3 = mesh.volume / 1000  # mm3 -> cm3
                    stats['weight'] = volume_cm3 * 1.24
            except:
                pass
                
    except Exception as e:
        logger.error(f"Ошибка парсинга G-code: {e}")
        
    return stats

@shared_task
def process_order_task(order_id):
    try:
        order = Order.objects.get(id=order_id)
        params = order.parameters
        
        # 0. Конвертация в GLB если нужно
        ext = order.file.name.split('.')[-1].lower()
        # Поддерживаемые форматы для конвертации в GLB
        if ext in ['obj', 'fbx', 'stl', 'dae', 'gltf', 'blend', 'skp', 'iges', 'step', 'vrml', 'ply', 'glb', '3mf', 'x', 'usd', 'usda', 'usdc']:
            new_path = convert_to_glb(order.file.path)
            if new_path.endswith('.glb'):
                with open(new_path, 'rb') as f:
                    new_name = os.path.basename(new_path)
                    order.file.save(new_name, ContentFile(f.read()), save=False)
                if os.path.exists(new_path): os.remove(new_path)

        # 1. Ремонт и подготовка (v2.0)
        order.status = 'repairing'
        order.save()
        
        mesh = trimesh.load(order.file.path)
        
        # Применяем трансформации из редактора
        if params.scale != 1.0:
            mesh.apply_scale(params.scale)
        
        rotation_matrix = trimesh.transformations.euler_matrix(
            params.rotation_x, params.rotation_y, params.rotation_z
        )
        mesh.apply_transform(rotation_matrix)

        if not mesh.is_watertight:
            mesh.fill_holes()
        
        # Сохраняем в 3MF
        mf3_data = mesh.export(file_type='3mf')
        mf3_filename = os.path.basename(order.file.name).rsplit('.', 1)[0] + '.3mf'
        order.file.save(mf3_filename, ContentFile(mf3_data), save=False)

        stl_data = mesh.export(file_type='stl')
        stl_filename = os.path.basename(order.file.name).rsplit('.', 1)[0] + '.stl'
        
        # 2. Слайсинг через CuraEngine
        order.status = 'slicing'
        order.save()
        
        # Временный файл для слайсинга
        temp_stl = f"/tmp/{stl_filename}"
        with open(temp_stl, 'wb') as f:
            f.write(stl_data)
            
        gcode_filename = stl_filename.rsplit('.', 1)[0] + '.gcode'
        gcode_path = f"/tmp/{gcode_filename}"
        
        cmd = [
            "CuraEngine", "slice",
            "-j", "/usr/share/cura/resources/definitions/fdmprinter.def.json",
            "-s", f"infill_sparse_density={params.infill}",
            "-s", f"layer_height={params.layer_height}",
            "-l", temp_stl,
            "-o", gcode_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            # 3. Расчет цены и статистики (v2.0)
            stats = parse_gcode_stats(gcode_path)
            order.estimated_weight = stats['weight']
            order.estimated_time = stats['time']
            
            price = 0
            if order.printer:
                price += (stats['time'] / 60.0) * float(order.printer.hourly_rate)
            if order.material:
                price += (stats['weight'] / 1000.0) * float(order.material.price_per_kg)
                order.material.weight_g -= stats['weight']
                order.material.save()
                
            order.final_price = round(price * 1.2, 2)
            
            with open(gcode_path, 'rb') as f:
                order.gcode_file.save(gcode_filename, ContentFile(f.read()), save=False)
            order.status = 'ready_to_print'
        else:
            order.status = 'failed'
            print(f"CuraEngine error: {result.stderr}")
            
        order.save()
        # Чистка
        if os.path.exists(temp_stl): os.remove(temp_stl)
        if os.path.exists(gcode_path): os.remove(gcode_path)
        
        return f"Order {order_id} processed"
    except Exception as e:
        if 'order' in locals():
            order.status = 'failed'
            order.save()
        return str(e)
