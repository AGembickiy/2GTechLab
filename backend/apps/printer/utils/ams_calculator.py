import trimesh
import math
from typing import Dict

# Средние потери филамента на очистку сопла при смене (в см3)
# Для Bambu Lab A1 с AMS Lite это значение может варьироваться от настроек "flush volume"
CHANGE_LOSS_PER_FILAMENT_CHANGE = 0.5 

def calculate_material_usage(mesh_path: str, layer_height: float = 0.2) -> Dict[str, float]:
    """
    Расчет расхода материала с учетом специфики AMS.
    Возвращает словарь {slot_id: volume_cm3}
    """
    try:
        mesh = trimesh.load(mesh_path)
        total_volume = mesh.volume / 1000  # Конвертация mm3 в cm3
        
        # В полноценной реализации здесь идет анализ слоев или метаданных 3MF
        # Для базовой автоматизации распределяем объем (заглушка логики распределения)
        material_distribution = {
            'slot_1': total_volume * 0.8,
            'slot_2': total_volume * 0.2
        }
        
        # Учет потерь на переключение (минимум 1 переключение если материалов > 1)
        active_slots = [v for v in material_distribution.values() if v > 0]
        if len(active_slots) > 1:
            filament_changes = len(active_slots) # Упрощенно: по одному сбросу на каждый материал
            loss = filament_changes * CHANGE_LOSS_PER_FILAMENT_CHANGE
            
            for slot in material_distribution:
                if material_distribution[slot] > 0:
                    material_distribution[slot] += (loss / len(active_slots))
        
        return {slot: round(vol, 3) for slot, vol in material_distribution.items()}
    except Exception as e:
        print(f"Error calculating volume: {e}")
        return {}
