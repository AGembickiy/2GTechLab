import trimesh
from typing import Dict, List
from pathlib import Path
from decimal import Decimal

# Коэффициенты цены за см³ материала для разных типов
PRICE_PER_CM3 = {
    'PLA': Decimal('0.35'),
    'ABS': Decimal('0.55'),
    'PETG': Decimal('0.75'),
    'TPU': Decimal('1.20'),
    'ASA': Decimal('0.95'),
    'PC': Decimal('1.50'),
}

# Базовая цена за печать (минимальный заказ)
BASE_PRICE = Decimal('5.00')

# Коэффициенты постобработки
POST_PROCESSING_MULTIPLIERS = {
    'none': Decimal('1.0'),
    'sanding': Decimal('1.2'),
    'painting': Decimal('1.5'),
    'dyeing': Decimal('1.3'),
    'vapor_smoothing': Decimal('1.4'),
    'polishing': Decimal('1.6'),
}

# Коэффициенты заполнения (density)
FILL_MULTIPLIERS = {
    '5%': Decimal('1.0'),
    '10%': Decimal('1.1'),
    '15%': Decimal('1.2'),
    '20%': Decimal('1.3'),
    '25%': Decimal('1.4'),
    '30%': Decimal('1.5'),
    '50%': Decimal('1.8'),
    '75%': Decimal('2.2'),
    '100%': Decimal('2.8'),
}

# Цена за поддержку
SUPPORT_PRICE_PER_CM2 = Decimal('0.05')


class PricingService:
    """Сервис расчёта стоимости печати"""
    
    def calculate(
        self,
        volume_cm3: float,
        material: str = 'PLA',
        fill_percentage: int = 15,
        post_processing: str = 'none',
        surface_area_cm2: float = 0,
        estimated_time_hours: float = 0,
        has_support: bool = False
    ) -> Dict[str, any]:
        """
        Расчёт стоимости печати по параметрам модели.
        
        Args:
            volume_cm3: Объём модели в см³
            material: Тип материала
            fill_percentage: Процент заполнения (5-100)
            post_processing: Вид постобработки
            surface_area_cm2: Площадь поверхности в см²
            estimated_time_hours: Оценочное время печати в часах
            has_support: Наличие поддержек
            
        Returns:
            Dict с детализацией цены и итоговой суммой
        """
        # Валидация
        volume_cm3 = max(volume_cm3, 0.01)  # Минимальный объём
        material = material.upper() if material.upper() in PRICE_PER_CM3 else 'PLA'
        fill_key = f'{fill_percentage}%'
        fill_key = fill_key if fill_key in FILL_MULTIPLIERS else '15%'
        
        # Базовая цена по объёму и материалу
        base_cost = Decimal(str(volume_cm3)) * PRICE_PER_CM3[material]
        
        # Множитель заполнения
        fill_cost = base_cost * FILL_MULTIPLIERS[fill_key]
        
        # Множитель постобработки
        pp_multiplier = POST_PROCESSING_MULTIPLIERS.get(post_processing, Decimal('1.0'))
        
        # Стоимость поддержек
        support_cost = Decimal('0')
        if has_support:
            support_cost = Decimal(str(surface_area_cm2)) * SUPPORT_PRICE_PER_CM2
        
        # Время печати (минимальная ставка за час работы принтера)
        machine_hour_rate = Decimal('2.50')
        time_cost = Decimal(str(estimated_time_hours)) * machine_hour_rate if estimated_time_hours > 0 else Decimal('0')
        
        # Итоговая цена
        subtotal = fill_cost + support_cost + time_cost
        total = subtotal * pp_multiplier
        
        # Минимальный заказ
        if total < BASE_PRICE:
            total = BASE_PRICE
        
        return {
            'volume_cm3': round(float(volume_cm3), 2),
            'material': material,
            'fill_percentage': fill_percentage,
            'post_processing': post_processing,
            'has_support': has_support,
            'estimated_time_hours': round(estimated_time_hours, 1),
            'breakdown': {
                'base_cost': round(float(base_cost), 2),
                'fill_multiplier': float(FILL_MULTIPLIERS[fill_key]),
                'fill_cost': round(float(fill_cost), 2),
                'support_cost': round(float(support_cost), 2),
                'time_cost': round(float(time_cost), 2),
                'pp_multiplier': float(pp_multiplier),
            },
            'subtotal': round(float(subtotal), 2),
            'total': round(float(total), 2),
            'currency': '€'
        }
    
    def analyze_stl(self, file_path: str) -> Dict[str, any]:
        """
        Анализ STL файла и расчёт параметров для счёта.
        
        Args:
            file_path: Путь к STL файле
            
        Returns:
            Dict с параметрами модели
        """
        try:
            mesh = trimesh.load(file_path)
            
            # Если меш загрузился как сцена (много мешей)
            if isinstance(mesh, trimesh.Scene):
                mesh = mesh.dump(concatenate=True)
            
            volume_mm3 = mesh.volume
            volume_cm3 = volume_mm3 / 1000
            
            bounds = mesh.bounds
            size_x = bounds[1][0] - bounds[0][0]
            size_y = bounds[1][1] - bounds[0][1]
            size_z = bounds[1][2] - bounds[0][2]
            
            surface_area_mm2 = 0
            if hasattr(mesh, 'area_faces'):
                surface_area_mm2 = sum(mesh.area_faces)
            surface_area_cm2 = surface_area_mm2 / 100
            
            # Примерная оценка времени печати (минуты на см³)
            estimated_minutes_per_cm3 = 30
            estimated_time_minutes = volume_cm3 * estimated_minutes_per_cm3
            estimated_time_hours = estimated_time_minutes / 60
            
            return {
                'status': 'success',
                'filename': Path(file_path).name,
                'dimensions_mm': {
                    'width': round(size_x, 2),
                    'height': round(size_y, 2),
                    'depth': round(size_z, 2)
                },
                'volume_cm3': round(volume_cm3, 3),
                'surface_area_cm2': round(surface_area_cm2, 2),
                'vertices': len(mesh.vertices),
                'faces': len(mesh.faces),
                'estimated_time_hours': round(estimated_time_hours, 1),
                'is_watertight': mesh.is_watertight,
                'bounding_box': {
                    'min': bounds[0].tolist(),
                    'max': bounds[1].tolist()
                }
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }


# Простая функция для быстрого расчёта (удобно для тестов)
def calculate_price(
    volume_cm3: float,
    material: str = 'PLA',
    fill_percentage: int = 15,
    post_processing: str = 'none',
    surface_area_cm2: float = 0,
    estimated_time_hours: float = 0,
    has_support: bool = False
) -> float:
    """Упрощённый расчёт стоимости"""
    service = PricingService()
    result = service.calculate(
        volume_cm3=volume_cm3,
        material=material,
        fill_percentage=fill_percentage,
        post_processing=post_processing,
        surface_area_cm2=surface_area_cm2,
        estimated_time_hours=estimated_time_hours,
        has_support=has_support
    )
    return result['total']
