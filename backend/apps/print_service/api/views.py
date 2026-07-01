from rest_framework import views
from rest_framework.response import Response
from ..models import Equipment, Material
import trimesh
import os
from django.core.files.storage import default_storage
from .serializers import DetectEquipmentResponseSerializer

class DetectEquipmentView(views.APIView):
    """
    Автоматически подбирает оборудование и палитру материалов.
    """
    def post(self, request):
        stl_file = request.FILES.get('file')
        if not stl_file:
            return Response({'error': 'Файл не передан'}, status=400)
        
        temp_path = None # Переменная для хранения пути к временному файлу
        try:
            # Сохраняем файл временно для анализа
            path = default_storage.save('temp/' + stl_file.name, stl_file)
            temp_path = default_storage.path(path)
            
            # --- Анализ модели ---
            mesh = trimesh.load_mesh(temp_path)
            model_volume = float(mesh.volume) # Объем в кубических метрах

            # 1. Находим подходящее оборудование по объему (выбираем самое маленькое из подходящих)
            suitable_equipment = Equipment.objects.filter(build_volume_m3__gte=model_volume).order_by('build_volume_m3')
            
            if not suitable_equipment.exists():
                return Response({'error': 'Нет оборудования с достаточной рабочей зоной'}, status=400)
            
            equipment = suitable_equipment.first()

            # 2. Получаем палитру материалов для этого оборудования (оптимизированный запрос)
            materials = Material.objects.filter(
                equipmentmaterial__equipment=equipment,
                temp_range_min__lte=equipment.max_temp,
                temp_range_max__gte=equipment.max_temp,
            ).order_by('?')[:4] # Лимит 4 материала, сортировка случайная для разнообразия

            palette = list(materials.values('id', 'name', 'color_hex'))
            
            response_data = {
                'equipment': {'id': equipment.id, 'name': equipment.name},
                'palette': palette,
                'message': f'Рекомендация: {equipment.name}'
            }
            
            # Валидация данных перед отправкой
            serializer = DetectEquipmentResponseSerializer(data=response_data)
            if not serializer.is_valid():
                return Response({'error': 'Ошибка формирования ответа', 'details': serializer.errors}, status=500)
            
            return Response(serializer.data, status=200)

        except Exception as e:
            return Response({'error': f'Не удалось проанализировать модель: {str(e)}'}, status=500)
        finally:
            # Безопасное удаление временного файла
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError as cleanup_error:
                    print(f"Предупреждение: не удалось удалить временный файл {temp_path}: {cleanup_error}")