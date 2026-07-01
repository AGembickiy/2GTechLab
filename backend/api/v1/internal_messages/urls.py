"""
API v1 internal_messages URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.api.v1.internal_messages.views import MessageViewSet

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
