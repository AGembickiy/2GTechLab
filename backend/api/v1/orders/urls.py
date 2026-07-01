"""
API v1 orders URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.api.v1.orders.views import OrderViewSet, OrderParameterViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-parameters', OrderParameterViewSet, basename='order-parameter')

urlpatterns = [
    path('', include(router.urls)),
]
