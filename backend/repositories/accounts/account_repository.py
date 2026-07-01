from typing import List, Optional
from django.db.models import QuerySet, Count
from django.contrib.auth.models import User


class AccountRepository:
    """Репозиторий для работы с аккаунтами пользователей."""

    @staticmethod
    def get_by_id(user_id: int) -> Optional[User]:
        """Получить пользователя по ID."""
        try:
            return User.objects.prefetch_related("orders", "sent_messages", "received_messages").get(pk=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_by_username(username: str) -> Optional[User]:
        """Получить пользователя по имени."""
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        """Получить пользователя по email."""
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_all() -> QuerySet[User]:
        """Получить всех пользователей."""
        return User.objects.all()

    @staticmethod
    def get_with_orders_count() -> QuerySet[User]:
        """Получить пользователей с количеством заказов."""
        return User.objects.annotate(
            orders_count=Count('orders')
        ).order_by('-orders_count')

    @staticmethod
    def create_user(
        username: str,
        email: str,
        password: str,
        first_name: str = "",
        last_name: str = ""
    ) -> User:
        """Создать нового пользователя."""
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

    @staticmethod
    def update_user(user: User, **fields) -> User:
        """Обновить данные пользователя."""
        for field, value in fields.items():
            setattr(user, field, value)
        user.save()
        return user

    @staticmethod
    def delete_user(user: User) -> None:
        """Удалить пользователя."""
        user.delete()
