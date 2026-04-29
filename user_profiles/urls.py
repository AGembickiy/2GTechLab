from django.urls import path
from . import views

app_name = 'user_profiles'

urlpatterns = [
    path('profile/', views.profile_view, name='profile'),
    path('users/', views.list_users_view, name='users-list'),
]