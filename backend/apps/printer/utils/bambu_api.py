import requests
import json

class BambuA1Client:
    """
    Клиент для взаимодействия с Bambu Lab A1 Combo через локальный API / MQTT.
    """
    def __init__(self, host: str, access_code: str, serial: str):
        self.host = host
        self.access_code = access_code
        self.serial = serial
        self.base_url = f"http://{host}/api/v1"

    def send_print_job(self, gcode_url: str, job_name: str, ams_mapping: list):
        """
        Отправка задания на печать.
        ams_mapping: list of dicts [{'slot': 1, 'material': 'PLA'}]
        """
        payload = {
            "command": "push_job",
            "params": {
                "url": gcode_url,
                "title": job_name,
                "ams_mapping": ams_mapping,
                "use_ams": True,
                "flow_calibration": True,
                "bed_leveling": True,
                "timelapse": True
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/print", 
                json=payload, 
                headers={"Authorization": f"Bearer {self.access_code}"},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_status(self):
        """Получение текущего статуса принтера и AMS"""
        try:
            response = requests.get(
                f"{self.base_url}/status",
                headers={"Authorization": f"Bearer {self.access_code}"},
                timeout=5
            )
            return response.json()
        except Exception as e:
            return {"status": "offline", "error": str(e)}
