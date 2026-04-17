from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

# Ограничение размера файла (50MB)
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB


def validate_file_size(value):
    """Валидатор размера загружаемого файла."""
    if value.size > MAX_UPLOAD_SIZE:
        raise ValidationError(f"Размер файла не должен превышать {MAX_UPLOAD_SIZE / (1024*1024):.0f}MB.")

# Валидаторы расширений
validate_3d_file = FileExtensionValidator(
    allowed_extensions=['stl', 'obj', '3ds', 'step', 'stp', 'iges', 'igs'],
    message="Неподдерживаемый формат 3D-модели. Допустимы: STL, OBJ, 3DS, STEP, IGES."
)

validate_2d_file = FileExtensionValidator(
    allowed_extensions=['jpg', 'jpeg', 'png', 'svg'],
    message="Неподдерживаемый формат изображения. Допустимы: JPG, JPEG, PNG, SVG."
)