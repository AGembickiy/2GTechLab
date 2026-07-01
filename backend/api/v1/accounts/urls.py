"""
API v1 accounts URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.api.v1.accounts.views import UserViewSet, ProfileViewSet, LoginView, LogoutView, UserMeView, DashboardStatsView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserMeView.as_view(), name='me'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard'),
    path('token/', LoginView.as_view(), name='token'),  # Add token endpoint for Nuxt
]
