from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, MaterialViewSet, PrinterViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'printers', PrinterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
