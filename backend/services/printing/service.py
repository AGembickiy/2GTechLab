from django.conf import settings
import os


class PrintingService:
    """Сервис управления печатью"""
    
    def __init__(self):
        self.printer_client = None
        self._init_printer_client()
    
    def _init_printer_client(self):
        """Инициализация клиента принтера"""
        try:
            from backend.apps.printer.utils.bambu_api import BambuA1Client
            host = os.getenv('PRINTER_HOST', '127.0.0.1')
            access_code = os.getenv('PRINTER_ACCESS_CODE', '')
            serial = os.getenv('PRINTER_SERIAL', '')
            
            if host and access_code:
                self.printer_client = BambuA1Client(host, access_code, serial)
        except ImportError:
            pass
    
    def prepare_gcode(self, stl_path: str, layer_height: float = 0.2) -> dict:
        """
        Подготовка G-code для печати.
        
        Args:
            stl_path: Путь к STL файлу
            layer_height: Высота слоя в мм
            
        Returns:
            Dict с путём к G-code и параметрами
        """
        return {
            'status': 'prepared',
            'gcode_path': f'/media/gcode/{os.path.basename(stl_path)}.gcode',
            'layer_height': layer_height,
            'print_time_minutes': 180,
        }
    
    def send_to_printer(self, gcode_path: str, job_name: str, ams_mapping: list = None) -> dict:
        """
        Отправка задания на печать.
        
        Args:
            gcode_path: Путь к G-code файлу
            job_name: Название задания
            ams_mapping: Сопоставление слотов AMS
            
        Returns:
            Dict с результатом отправки
        """
        if self.printer_client:
            result = self.printer_client.send_print_job(
                gcode_url=gcode_path,
                job_name=job_name,
                ams_mapping=ams_mapping or []
            )
            return result
        
        return {
            'status': 'simulated',
            'message': f'Задание "{job_name}" отправлено на печать (режим симуляции)'
        }
    
    def get_printer_status(self) -> dict:
        """Получение статуса принтера"""
        if self.printer_client:
            return self.printer_client.get_status()
        return {'status': 'offline', 'message': 'Принтер не настроен'}
