from backend.repositories.accounts.account_repository import AccountRepository
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class AccountService:
    """Сервис управления аккаунтами."""

    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        """Получить пользователя по ID."""
        return AccountRepository.get_by_id(user_id)

    @staticmethod
    def get_user_by_username(username: str) -> User:
        """Получить пользователя по имени."""
        return AccountRepository.get_by_username(username)

    @staticmethod
    def create_user(
        username: str,
        email: str,
        password: str,
        first_name: str = "",
        last_name: str = ""
    ) -> User:
        """Создать нового пользователя."""
        if User.objects.filter(username=username).exists():
            raise ValidationError("Username already exists")
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already exists")

        return AccountRepository.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

    @staticmethod
    def update_user(user: User, **fields) -> User:
        """Обновить данные пользователя."""
        return AccountRepository.update_user(user, **fields)

    @staticmethod
    def get_users_with_orders_count() -> list:
        """Получить пользователей с количеством заказов."""
        return list(AccountRepository.get_with_orders_count())
