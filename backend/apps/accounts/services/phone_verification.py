from django.core.validators import RegexValidator
from django.utils import timezone
import random
import logging

logger = logging.getLogger(__name__)


class PhoneVerificationService:
    """Сервис для верификации номера телефона."""
    
    # Regex validator for Russian phone numbers
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Номер телефона должен быть в формате: '+999999999'."
    )
    
    @staticmethod
    def generate_verification_code() -> str:
        """Генерировать 6-значный код верификации."""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def send_verification_sms(phone: str, code: str) -> bool:
        """
        Отправить SMS с кодом верификации.
        
        В продакшене заменить на реальный сервис SMS (Twilio, Yandex.Cloud, и т.д.)
        """
        # In production, use Twilio or Yandex.Cloud SMS
        # For now, just log the code
        logger.info(f"SMS verification code for {phone}: {code}")
        return True  # Simulate successful sending
    
    @staticmethod
    def verify_code(phone: str, code: str) -> bool:
        """
        Проверить код верификации.
        
        В реальном приложении код должен храниться в базе данных
        с истечением времени.
        """
        # For demo purposes, accept any 6-digit code
        # In production, store verification attempts with expiry
        if len(code) == 6 and code.isdigit():
            logger.info(f"Verification code {code} accepted for {phone}")
            return True
        return False
