from django.urls import path, include
from backend.apps.warehouse.api import urls as warehouse_urls

app_name = 'warehouse'

urlpatterns = [
    path('', include(warehouse_urls)),
]
