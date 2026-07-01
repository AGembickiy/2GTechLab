from typing import List, Optional
from django.contrib.auth.models import User


class UserRepository:
    def get_by_id(self, user_id: int) -> Optional[User]:
        return User.objects.select_related('profile').filter(id=user_id).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        return User.objects.select_related('profile').filter(username=username).first()
    
    def create_user(self, username: str, email: str, password: str) -> User:
        return User.objects.create_user(username=username, email=email, password=password)
