# Celery задачи: конвертация, нарезка, уведомления
from celery import shared_task

@shared_task
def convert_file_task(file_path):
    """
    Задача для конвертации файлов
    """
    # Здесь будет логика конвертации
    print(f"Конвертация файла: {file_path}")
    return f"Файл {file_path} успешно сконвертирован"

@shared_task
def cut_material_task(material_id, length):
    """
    Задача для нарезки материала
    """
    # Здесь будет логика нарезки
    print(f"Нарезка материала {material_id} на длину {length}")
    return f"Материал {material_id} успешно нарезан на {length}"

@shared_task
def send_notification_task(order_id, message):
    """
    Задача для отправки уведомлений
    """
    # Здесь будет логика отправки уведомлений
    print(f"Отправка уведомления для заказа {order_id}: {message}")
    return f"Уведомление для заказа {order_id} отправлено"