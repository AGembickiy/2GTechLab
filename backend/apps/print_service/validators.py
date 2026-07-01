from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

# Ограничение размера файла (50MB)
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB


def validate_file_size(value):
    """Валидатор размера загружаемого файла."""
    if value.size > MAX_UPLOAD_SIZE:
        raise ValidationError(f"Размер файла не должен превышать {MAX_UPLOAD_SIZE / (1024*1024):.0f}MB.")

# Валидаторы расширений
# Поддерживаемые 3D форматы для конвертации в GLB
# Trimesh: STL, OBJ, PLY, GLB, GLTF
# Blender: FBX, DAE, 3DS, BLEND, 3MF, X
# USD: USD, USDA, USDC
validate_3d_file = FileExtensionValidator(
    allowed_extensions=['stl', 'obj', 'ply', 'glb', 'gltf', 'fbx', 'dae', '3ds', 'blend', '3mf', 'x', 'usd', 'usda', 'usdc', 'step', 'stp', 'iges', 'igs'],
    message="Неподдерживаемый формат 3D-модели. Допустимы: STL, OBJ, PLY, GLB, GLTF, FBX, DAE, 3DS, BLEND, 3MF, X, USD, USDA, USDC, STEP, IGES."
)

validate_2d_file = FileExtensionValidator(
    allowed_extensions=['jpg', 'jpeg', 'png', 'svg'],
    message="Неподдерживаемый формат изображения. Допустимы: JPG, JPEG, PNG, SVG."
)