# Common validators for 2GTechLab

from rest_framework import serializers


def validate_positive(value):
    """Validate that value is positive."""
    if value <= 0:
        raise serializers.ValidationError("Значение должно быть положительным.")
    return value


def validate_file_size(value):
    """Validate file size (max 50MB)."""
    max_size = 50 * 1024 * 1024
    if value.size > max_size:
        raise serializers.ValidationError("Размер файла не должен превышать 50MB.")
    return value


def validate_file_extension(value):
    """Validate file extension for 3D models."""
    valid_extensions = ['.stl', '.obj', '.fbx', '.dae', '.gltf', '.glb', '.3mf']
    ext = value.name.split('.')[-1].lower()
    if f'.{ext}' not in valid_extensions:
        raise serializers.ValidationError(f"Недопустимый формат файла. Допустимые: {', '.join(valid_extensions)}")
    return value
