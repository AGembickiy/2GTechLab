from django.db import models
from django.contrib.auth.models import User


class Message(models.Model):
    """Внутренние сообщения между пользователями."""
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )
    subject = models.CharField("Тема", max_length=255)
    body = models.TextField("Тело сообщения")
    is_read = models.BooleanField("Прочитано", default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    replied_at = models.DateTimeField("Ответ отправлен", null=True, blank=True)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.sender.username} to {self.recipient.username}"

    def mark_as_read(self) -> None:
        """Пометить как прочитанное."""
        self.is_read = True
        self.save()
