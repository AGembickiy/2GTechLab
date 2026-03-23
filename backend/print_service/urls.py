from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"material-presets", views.MaterialPresetViewSet, basename="material-preset")
router.register(r"print-jobs", views.PrintJobViewSet, basename="print-job")

urlpatterns = [
    path("", include(router.urls)),
    path("slot-assignments/", views.SlotAssignmentCreateView.as_view(), name="slot-assignments"),
    # Не вложено в router, чтобы не конфликтовать с /print-jobs/{pk}/
    path("jobs/<int:job_id>/surfaces/", views.SurfaceListCreateView.as_view(), name="job-surfaces"),
    path("moonraker/status/", views.MoonrakerStatusView.as_view(), name="moonraker-status"),
]
