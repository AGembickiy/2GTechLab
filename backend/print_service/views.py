from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MaterialPreset, PrintJob, SlotAssignment, Surface
from .serializers import (
    MaterialPresetSerializer,
    PrintJobCreateSerializer,
    PrintJobSerializer,
    SlotAssignmentSerializer,
    SlotBulkAssignSerializer,
    SurfaceSerializer,
)
from .services.moonraker import MoonrakerClient
from .tasks import slice_and_analyze_task


class MaterialPresetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaterialPreset.objects.all()
    serializer_class = MaterialPresetSerializer


class PrintJobViewSet(viewsets.ModelViewSet):
    queryset = PrintJob.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == "create":
            return PrintJobCreateSerializer
        return PrintJobSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(PrintJobSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="slice")
    def slice(self, request, pk=None):
        job = self.get_object()
        if job.status not in ("preview", "draft"):
            return Response({"error": "Неверный статус для слайсинга"}, status=status.HTTP_400_BAD_REQUEST)
        job.status = "slicing"
        job.save(update_fields=["status"])
        slice_and_analyze_task.delay(job.id)
        return Response({"status": "slicing_started", "job_id": job.id}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["get"], url_path="slot-assignments")
    def slot_assignments(self, request, pk=None):
        job = self.get_object()
        qs = job.slot_assignments.all()
        return Response(SlotAssignmentSerializer(qs, many=True).data)


class SlotAssignmentCreateView(generics.GenericAPIView):
    serializer_class = SlotBulkAssignSerializer

    def post(self, request):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        job = get_object_or_404(PrintJob, pk=ser.validated_data["job_id"])
        slot_index = ser.validated_data["slot_index"]
        preset_id = ser.validated_data["material_preset_id"]

        obj, _created = SlotAssignment.objects.update_or_create(
            job=job,
            slot_index=slot_index,
            defaults={"material_preset_id": preset_id},
        )
        return Response(SlotAssignmentSerializer(obj).data, status=status.HTTP_200_OK)


class SurfaceListCreateView(generics.ListCreateAPIView):
    serializer_class = SurfaceSerializer

    def get_queryset(self):
        job_id = self.kwargs.get("job_id")
        return Surface.objects.filter(job_id=job_id)

    def perform_create(self, serializer):
        job = get_object_or_404(PrintJob, pk=self.kwargs["job_id"])
        serializer.save(job=job)


class MoonrakerStatusView(APIView):
    """Прокси к Moonraker HTTP API (чтобы фронт не упирался в CORS принтера)."""

    def get(self, request):
        try:
            client = MoonrakerClient()
            data = client.get_printer_objects()
            return Response(data)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
