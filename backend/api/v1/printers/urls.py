"""
API v1 printers URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.api.v1.printers.views import EquipmentViewSet

router = DefaultRouter()
router.register(r'printers', EquipmentViewSet, basename='printer')

urlpatterns = [
    path('', include(router.urls)),
]
