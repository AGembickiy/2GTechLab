from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """Профиль пользователя."""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    role = models.CharField(
        max_length=20,
        choices=[('admin', 'Администратор'), ('manager', 'Менеджер'), ('client', 'Клиент'), ('partner', 'Партнёр')],
        default='client'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'

    def __str__(self):
        return f'{self.user.username} - {self.get_role_display()}'
