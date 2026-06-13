from django.urls import path
from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.registry.extend(api.router.registry)

urlpatterns = [
    path('', include(router.urls)),
]
