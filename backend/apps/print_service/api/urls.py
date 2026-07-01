from django.urls import path
from .views import DetectEquipmentView

urlpatterns = [
    path('detect-equipment/', DetectEquipmentView.as_view(), name='detect-equipment'),
]