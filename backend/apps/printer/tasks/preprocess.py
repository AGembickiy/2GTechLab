import os
import tempfile
import trimesh
from celery import shared_task
from django.conf import settings
from ..utils.ams_calculator import calculate_material_usage

@shared_task(bind=True, name='printer.preprocess_model')
def preprocess_model(self, file_content: bytes, filename: str):
    """
    Асинхронная задача предварительной обработки 3D модели.
    1. Сохранение во временный файл
    2. Оптимизация геометрии (Trimesh)
    3. Расчет расхода материала для AMS
    4. Конвертация в GLB для предпросмотра
    """
    self.update_state(state='PROGRESS', meta={'status': 'Загрузка файла...'})
    
    suffix = os.path.splitext(filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
        f.write(file_content)
        temp_path = f.name

    try:
        # Загрузка меша
        self.update_state(state='PROGRESS', meta={'status': 'Анализ геометрии...'})
        mesh = trimesh.load(temp_path)
        
        # Базовая оптимизация
        if not mesh.is_watertight:
            self.update_state(state='PROGRESS', meta={'status': 'Исправление сетки...'})
            mesh.fill_holes()
        
        # Расчет расхода для AMS
        self.update_state(state='PROGRESS', meta={'status': 'Расчет расхода материалов...'})
        usage = calculate_material_usage(temp_path)
        
        # Экспорт в GLB для фронтенда
        self.update_state(state='PROGRESS', meta={'status': 'Генерация превью...'})
        glb_filename = f"{os.path.splitext(filename)[0]}.glb"
        glb_path = os.path.join(settings.MEDIA_ROOT, 'previews', glb_filename)
        os.makedirs(os.path.dirname(glb_path), exist_ok=True)
        
        mesh.export(glb_path, file_type='glb')
        
        return {
            'status': 'SUCCESS',
            'filename': filename,
            'glb_url': f"{settings.MEDIA_URL}previews/{glb_filename}",
            'ams_usage': usage,
            'stats': {
                'vertices': len(mesh.vertices),
                'faces': len(mesh.faces),
                'volume_cm3': round(mesh.volume / 1000, 2)
            }
        }
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        return {'status': 'ERROR', 'message': str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
