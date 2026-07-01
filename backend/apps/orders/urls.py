"""
Orders URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.apps.orders.views.order_views import OrderViewSet, OrderParameterViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-parameters', OrderParameterViewSet, basename='order-parameter')

urlpatterns = [
    path('', include(router.urls)),
]
