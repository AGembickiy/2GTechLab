"""
API v1 print_service URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.api.v1.print_service.views import PrintJobViewSet, MaterialPresetViewSet

router = DefaultRouter()
router.register(r'print-jobs', PrintJobViewSet, basename='print-job')
router.register(r'material-presets', MaterialPresetViewSet, basename='material-preset')

urlpatterns = [
    path('', include(router.urls)),
]
