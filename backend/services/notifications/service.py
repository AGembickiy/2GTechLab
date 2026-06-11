from django.core.mail import send_mail
from django.conf import settings


class NotificationService:
    """Сервис уведомлений"""
    
    def send_order_confirmation(self, order_id: int, user_email: str, user_name: str):
        """
        Отправка подтверждения заказа.
        
        Args:
            order_id: ID заказа
            user_email: Email пользователя
            user_name: Имя пользователя
        """
        subject = f'Подтверждение заказа #{order_id}'
        message = f"""
        Здравствуйте, {user_name}!
        
        Ваш заказ #{order_id} принят в обработку.
        Мы свяжемся с вами для уточнения деталей.
        
        Спасибо за выбор 2GTechLab!
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False
        )
    
    def send_order_status_update(self, order_id: int, user_email: str, new_status: str):
        """
        Уведомление об изменении статуса заказа.
        
        Args:
            order_id: ID заказа
            user_email: Email пользователя
            new_status: Новый статус
        """
        status_labels = {
            'pending': 'В ожидании',
            'processing': 'В производстве',
            'completed': 'Завершён',
            'cancelled': 'Отменён',
        }
        
        subject = f'Обновление статуса заказа #{order_id}'
        message = f"""
        Здравствуйте!
        
        Статус вашего заказа #{order_id} изменён на: {status_labels.get(new_status, new_status)}
        
        Подробности в личном кабинете.
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False
        )
    
    def send_printing_started(self, order_id: int, user_email: str, printer_name: str = 'Bambu A1'):
        """
        Уведомление о начале печати.
        
        Args:
            order_id: ID заказа
            user_email: Email пользователя
            printer_name: Имя принтера
        """
        subject = f'Печать заказа #{order_id} началась'
        message = f"""
        Здравствуйте!
        
        Ваш заказ #{order_id} начал печататься на принтере {printer_name}.
        
        Мы обновим вас по мере готовности.
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False
        )
