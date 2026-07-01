"""
API v1 catalog URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.api.v1.catalog.views import MaterialViewSet, PrinterViewSet

router = DefaultRouter()
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'printers', PrinterViewSet, basename='printer')

urlpatterns = [
    path('', include(router.urls)),
]
