from decimal import Decimal
import os
import tempfile

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MaterialPreset, PrintJob, SlotAssignment, Surface
from .serializers import (
    MaterialPresetSerializer,
    PrintJobCreateSerializer,
    PrintJobSerializer,
    SliceJobSerializer,
    SlotAssignmentSerializer,
    SlotBulkAssignSerializer,
    SurfaceSerializer,
)
from .services.conversion import try_convert_to_stl
from .tasks.slicing import process_3d_model

# Инициализация Celery приложения
from celery import Celery

celery_app = Celery('print_service')
celery_app.config_from_object('django.conf:settings', namespace='CELERY')

EXT_3D = frozenset({"stl", "obj", "fbx", "dae", "gltf", "glb", "blend", "skp", "iges", "igs", "step", "stp", "wrl", "vrml"})
EXT_2D = frozenset({"jpg", "jpeg", "png", "svg"})


class ConvertToGlbView(APIView):
    """Конвертация загруженного 3D файла в GLB для предпросмотра."""
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        file_obj = request.FILES.get("file") or request.FILES.get("original_file")
        if not file_obj:
            return Response({"detail": "Файл не отправлен"}, status=status.HTTP_400_BAD_REQUEST)

        original_name = (file_obj.name or "model").lower()
        ext = original_name.rsplit(".", 1)[-1] if "." in original_name else ""
        if ext and ext not in EXT_3D:
            return Response(
                {"detail": f"Формат .{ext} не поддерживается для 3D-конвертации."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        temp_input_path = None
        try:
            import trimesh

            suffix = f".{ext}" if ext else ".stl"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_input:
                for chunk in file_obj.chunks():
                    temp_input.write(chunk)
                temp_input_path = temp_input.name

            loaded = trimesh.load(temp_input_path, force="mesh")
            if isinstance(loaded, trimesh.Scene):
                geoms = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
                if not geoms:
                    return Response({"detail": "Не удалось извлечь mesh из модели."}, status=status.HTTP_400_BAD_REQUEST)
                loaded = trimesh.util.concatenate(geoms)
            if not isinstance(loaded, trimesh.Trimesh):
                return Response({"detail": "Файл не содержит корректной mesh-геометрии."}, status=status.HTTP_400_BAD_REQUEST)

            glb_bytes = loaded.export(file_type="glb")
            base_name = os.path.splitext(file_obj.name or "model")[0]
            file_name = f"{base_name}.glb"
            response = HttpResponse(glb_bytes, content_type="model/gltf-binary", status=status.HTTP_200_OK)
            response["Content-Disposition"] = f'attachment; filename="{file_name}"'
            return response
        except ImportError:
            return Response(
                {"detail": "Конвертация недоступна: установите trimesh и numpy."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as exc:
            return Response({"detail": f"Ошибка конвертации: {exc}"}, status=status.HTTP_400_BAD_REQUEST)
        finally:
            if temp_input_path and os.path.exists(temp_input_path):
                try:
                    os.remove(temp_input_path)
                except OSError:
                    pass

class UploadView(APIView):
    """POST multipart: поле `file` (или `original_file`) — модель или эскиз."""
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("file") or request.FILES.get("original_file")
        if not file_obj:
            return Response({"detail": "Файл не отправлен"}, status=status.HTTP_400_BAD_REQUEST)

        name = (file_obj.name or "").lower()
        if "." not in name:
            return Response({"detail": "Укажите файл с расширением."}, status=status.HTTP_400_BAD_REQUEST)
        ext = name.rsplit(".", 1)[-1]
        if ext not in EXT_3D and ext not in EXT_2D:
            return Response(
                {
                    "detail": (
                        f"Неподдерживаемый формат .{ext}. Допустимы 3D: {', '.join(sorted(EXT_3D))}; "
                        f"эскизы: {', '.join(sorted(EXT_2D))}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_3d = ext in EXT_3D
        job = PrintJob.objects.create(
            user=request.user if request.user.is_authenticated else None,
            original_file=file_obj,
            status="preview",
            upload_kind="model" if is_3d else "sketch",
        )

        preview_url = None
        conversion_error = None

        if is_3d:
            # Для 3D моделей конвертируем в STL и GLB для предпросмотра
            success, error = try_convert_to_stl(job)
            if success:
                # Используем converted_glb для предпросмотра, если он существует, иначе fallback на converted_stl
                if job.converted_glb and hasattr(job.converted_glb, 'url'):
                    preview_url = request.build_absolute_uri(job.converted_glb.url)
                elif job.converted_stl and hasattr(job.converted_stl, 'url'):
                    preview_url = request.build_absolute_uri(job.converted_stl.url)
                else:
                    conversion_error = "Не удалось сгенерировать файл для предпросмотра."
            else:
                conversion_error = error
        else:
            # Для эскизов используем оригинальный файл
            preview_url = request.build_absolute_uri(job.original_file.url)

        response_data = {
            "job_id": job.id,
            "is_3d": is_3d,
            "is_model": is_3d,
            "preview_url": preview_url,
            "status": job.status,
        }

        if conversion_error:
            response_data["conversion_error"] = conversion_error

        return Response(response_data, status=status.HTTP_201_CREATED)

class PrintJobResultView(APIView):
    """GET — готовность расчёта, стоимость и время."""
    def get(self, request, pk):
        job = get_object_or_404(
            PrintJob.objects.prefetch_related(
                'slot_assignments__material_preset'
            ), 
            pk=pk
        )
        if job.status == "slicing":
            return Response({"ready": False, "status": job.status}, status=status.HTTP_200_OK)
        
        if job.status == "error":
            return Response({"ready": True, "status": job.status, "detail": job.last_error}, status=status.HTTP_200_OK)

        total_cost = sum((sa.cost or Decimal("0")) for sa in job.slot_assignments.all())
        slots_data = [
            {
                "slot_index": sa.slot_index,
                "material": sa.material_preset.name,
                "color": sa.material_preset.color_hex,
                "length_mm": sa.length_mm,
                "mass_g": sa.mass_g,
                "cost": float(sa.cost or Decimal("0")),
            }
            for sa in job.slot_assignments.all()
        ]
        return Response(
            {
                "ready": True,
                "status": job.status,
                "total_cost": float(total_cost),
                "print_time_minutes": job.estimated_print_time_minutes or 0,
                "slots": slots_data,
            },
            status=status.HTTP_200_OK,
        )

class MaterialPresetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaterialPreset.objects.all()
    serializer_class = MaterialPresetSerializer
    permission_classes = [permissions.AllowAny]

class PrintJobViewSet(viewsets.ModelViewSet):
    queryset = PrintJob.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == "create":
            return PrintJobCreateSerializer
        return PrintJobSerializer

    @action(detail=True, methods=["post"], url_path="slice")
    def slice(self, request, pk=None):
        job = self.get_object()
        ser = SliceJobSerializer(data=request.data or {}, context={"job": job})
        ser.is_valid(raise_exception=True)

        # Обновляем назначения материалов до запуска slicing.
        assignments = ser.validated_data.get("assignments", [])
        if assignments:
            SlotAssignment.objects.filter(job=job).delete()
            Surface.objects.filter(job=job).delete()
            for item in assignments:
                slot_assignment = SlotAssignment.objects.create(
                    job=job,
                    slot_index=item["slot_index"],
                    material_preset_id=item["material_preset_id"],
                )
                for raw_surface_id in item.get("surface_ids", []):
                    # surface_id приходит в формате `polygon_<id>` из ThreeViewer.
                    # Храним как Surface для последующего расчета долей расхода по слотам.
                    surface_name = (raw_surface_id or "").strip()
                    if not surface_name:
                        continue
                    Surface.objects.create(
                        job=job,
                        name=surface_name,
                        index=0,
                        selected=True,
                        slot_assignment=slot_assignment.slot_index,
                    )

        job.status = "slicing"
        job.save()
        # Вызов задачи Celery
        # В режиме разработки (CELERY_TASK_ALWAYS_EAGER=True) задача выполнится синхронно
        process_3d_model.delay(job.id)
        return Response({"status": "slicing_started", "job_id": job.id}, status=status.HTTP_202_ACCEPTED)
