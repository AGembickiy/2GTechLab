from rest_framework.routers import DefaultRouter
from .views import (
    MaterialPresetViewSet,
    PrintJobViewSet,
    PrintJobResultView,
    UploadView,
    ConvertToGlbView,
)

router = DefaultRouter()
router.register(r'material-presets', MaterialPresetViewSet)
router.register(r'print-jobs', PrintJobViewSet)

urlpatterns = []
