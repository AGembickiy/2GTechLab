from typing import Dict, Optional
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User

from user_profiles.models import Profile


class UserService:
    """Сервис управления профилями пользователей"""
    
    def get_or_create_profile(self, user: User) -> Profile:
        """
        Получение или создание профиля пользователя.
        
        Args:
            user: Объект пользователя Django
            
        Returns:
            Profile объект
        """
        profile, created = Profile.objects.get_or_create(user=user)
        return profile
    
    def get_profile_by_user_id(self, user_id: int) -> Optional[Profile]:
        """
        Получение профиля по ID пользователя.
        
        Args:
            user_id: ID пользователя
            
        Returns:
            Profile объект или None
        """
        try:
            return Profile.objects.get(user_id=user_id)
        except Profile.DoesNotExist:
            return None
    
    def get_profile_by_email(self, email: str) -> Optional[Profile]:
        """
        Получение профиля по email пользователя.
        
        Args:
            email: Email пользователя
            
        Returns:
            Profile объект или None
        """
        try:
            user = User.objects.get(email=email)
            return Profile.objects.get(user=user)
        except (User.DoesNotExist, Profile.DoesNotExist):
            return None
    
    def update_profile(
        self,
        user: User,
        phone: str = None,
        address: str = None,
        role: str = None
    ) -> Dict[str, any]:
        """
        Обновление данных профиля пользователя.
        
        Args:
            user: Объект пользователя
            phone: Новый номер телефона
            address: Новый адрес
            role: Новая роль
            
        Returns:
            Dict с результатом обновления
        """
        profile = self.get_or_create_profile(user)
        
        updated_fields = []
        
        if phone is not None and phone != profile.phone:
            profile.phone = phone
            updated_fields.append('phone')
        
        if address is not None and address != profile.address:
            profile.address = address
            updated_fields.append('address')
        
        if role is not None and role in dict(Profile.role.field.choices):
            profile.role = role
            updated_fields.append('role')
        
        if updated_fields:
            profile.save()
        
        return {
            'status': 'success',
            'updated_fields': updated_fields,
            'profile': {
                'phone': profile.phone,
                'address': profile.address,
                'role': profile.get_role_display(),
            }
        }
    
    def get_user_orders(self, user: User) -> list:
        """
        Получение заказов пользователя.
        
        Args:
            user: Объект пользователя
            
        Returns:
            Список заказов пользователя
        """
        # TODO: Связать Order с User через ForeignKey
        # Сейчас возвращается заглушка
        from orders.models import Order
        return list(Order.objects.filter(user=user) if hasattr(Order, 'user') else [])
    
    def convert_to_partner(self, user: User) -> Dict[str, any]:
        """
        Конвертация пользователя в партнёра.
        
        Args:
            user: Объект пользователя
            
        Returns:
            Dict с результатом операции
        """
        profile = self.get_or_create_profile(user)
        profile.role = 'partner'
        profile.save()
        
        return {
            'status': 'success',
            'message': 'Пользователь успешно конвертирован в партнёра',
            'user_id': user.id,
            'new_role': 'partner',
        }
    
    def get_partner_orders(self, user: User) -> list:
        """
        Получение заказов партнёра (все заказы для партнёра).
        
        Args:
            user: Объект партнёра
            
        Returns:
            Список заказов
        """
        # TODO: Связать Order с User через ForeignKey
        # Здесь логика для получения заказов партнёра
        return []
    
    def get_user_stats(self, user: User) -> Dict[str, any]:
        """
        Получение статистики пользователя.
        
        Args:
            user: Объект пользователя
            
        Returns:
            Dict со статистикой
        """
        # TODO: Связать Order с User через ForeignKey
        return {
            'total_orders': 0,
            'completed_orders': 0,
            'pending_orders': 0,
            'total_spent': 0.0,
        }
