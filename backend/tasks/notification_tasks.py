import os
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_email_task(subject, message, from_email, recipient_list):
    """Отправить email сообщение."""
    send_mail(
        subject,
        message,
        from_email,
        recipient_list,
        fail_silently=False,
    )
    return True


@shared_task
def process_order_notification(order_id, user_email, order_status):
    """Обработать уведомление о заказе."""
    subject = f"Статус заказа #{order_id} изменен"
    message = f"Заказ #{order_id} теперь в статусе: {order_status}"
    
    send_email_task.delay(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email]
    )
    return True


@shared_task
def generate_and_send_invoice(order_id, user_email):
    """Сгенерировать и отправить счет."""
    # In production, generate PDF invoice and send via email
    subject = f"Счет за заказ #{order_id}"
    message = f"Счет за заказ #{order_id} прилагается к этому письму."
    
    send_email_task.delay(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email]
    )
    return True


@shared_task
def update_inventory_on_order(order_id, items):
    """Обновить инвентарь при изменении заказа."""
    # In production, update warehouse stock based on order changes
    for item in items:
        item_id = item['item_id']
        quantity_change = item['quantity_change']
        # Call warehouse service to update stock
    return True


@shared_task
def send_sms_notification(phone, message):
    """Отправить SMS уведомление."""
    # In production, use Twilio or Yandex.Cloud SMS service
    # For now, just log the message
    print(f"SMS to {phone}: {message}")
    return True


@shared_task
def send_phone_verification_code(phone, code):
    """Отправить код верификации телефона."""
    message = f"Ваш код верификации: {code}. Не передавайте его никому."
    
    send_sms_notification.delay(
        phone=phone,
        message=message
    )
    return True
