"""
Model Views
"""
import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from backend.services.pricing.service import PricingService


class AnalyzeModelView(APIView):
    """Анализ 3D модели"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Анализ загруженной STL модели"""
        file = request.FILES.get('file')
        file_url = request.data.get('file_url')
        
        if not file and not file_url:
            return Response(
                {'error': 'Требуется файл или file_url'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pricing_service = PricingService()
            
            if file:
                # Обработка загруженного файла
                with open('/tmp/temp.stl', 'wb+') as temp_file:
                    for chunk in file.chunks():
                        temp_file.write(chunk)
                
                try:
                    result = pricing_service.analyze_stl('/tmp/temp.stl')
                finally:
                    if os.path.exists('/tmp/temp.stl'):
                        os.remove('/tmp/temp.stl')
            else:
                result = {
                    'status': 'error',
                    'error': 'Анализ по URL не реализован'
                }
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {'status': 'error', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadModelView(APIView):
    """Загрузка 3D модели"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Загрузка STL файла"""
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'error': 'Требуется файл'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверка расширения
        from pathlib import Path
        ext = Path(file.name).suffix.lower()
        # Поддерживаемые форматы: STL, OBJ, PLY, GLB, GLTF, FBX, DAE, 3DS, BLEND, 3MF, X, USD, USDA, USDC
        if ext not in ['.stl', '.obj', '.ply', '.glb', '.gltf', '.fbx', '.dae', '.3ds', '.blend', '.3mf', '.x', '.usd', '.usda', '.usdc']:
            return Response(
                {'error': 'Неподдерживаемый формат. Используйте STL, OBJ, PLY, GLB, GLTF, FBX, DAE, 3DS, BLEND, 3MF, X, USD, USDA, USDC'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Сохранение файла
        upload_dir = '/home/g/2GTechLab/media/models/uploaded'
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        return Response({
            'status': 'success',
            'file_url': f'/media/models/uploaded/{file.name}',
            'filename': file.name
        }, status=status.HTTP_201_CREATED)
