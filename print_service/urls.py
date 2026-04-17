from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    ConvertToGlbView,
    MaterialPresetViewSet,
    PrintJobResultView,
    PrintJobViewSet,
    UploadView,
)
from .api.urls import urlpatterns as api_urlpatterns

router = DefaultRouter()
router.register(r"material-presets", MaterialPresetViewSet)
router.register(r"print-jobs", PrintJobViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("convert-to-glb", ConvertToGlbView.as_view(), name="convert-to-glb"),
    path("upload/", UploadView.as_view(), name="upload"),
    path("print-jobs/<int:pk>/result/", PrintJobResultView.as_view(), name="print-job-result"),
]

# Включаем URL-ы для нового API
urlpatterns += api_urlpatterns
