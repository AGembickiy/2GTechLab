from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from backend.apps.print_service.models.print_job import PrintJob
from backend.apps.print_service.models.material_preset import MaterialPreset
from backend.apps.print_service.serializers.print_service_serializer import PrintJobSerializer, MaterialPresetSerializer


class PrintJobViewSet(viewsets.ModelViewSet):
    """ViewSet для управления заданиями на печать."""
    queryset = PrintJob.objects.all().select_related('user')
    serializer_class = PrintJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return PrintJob.objects.all().select_related('user')
        return PrintJob.objects.filter(user=self.request.user).select_related('user')


class MaterialPresetViewSet(viewsets.ModelViewSet):
    """ViewSet для управления предустановками материалов."""
    queryset = MaterialPreset.objects.all()
    serializer_class = MaterialPresetSerializer
    permission_classes = [IsAuthenticated]
