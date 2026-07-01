from django.apps import AppConfig


class InternalMessagesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.apps.internal_messages'
    verbose_name = 'Внутренние сообщения'
