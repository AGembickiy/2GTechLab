from rest_framework.throttling import UserRateThrottle, AnonRateThrottle, ScopedRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Ограничение частоты запросов для коротких всплесков."""
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """Ограничение частоты запросов для длительного использования."""
    scope = 'sustained'


class LoginRateThrottle(AnonRateThrottle):
    """Ограничение частоты попыток входа."""
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """Ограничение частоты регистраций."""
    scope = 'register'


class PhoneVerificationRateThrottle(AnonRateThrottle):
    """Ограничение частоты отправки SMS."""
    scope = 'phone_verification'
