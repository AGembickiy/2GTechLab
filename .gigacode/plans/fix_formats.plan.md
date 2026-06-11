# План исправления поддержки 3D форматов

## Задача
Расширить поддержку форматов для конвертации в GLB: OBJ, PLY, GLB, GLTF, FBX, DAE, 3DS, BLEND, 3MF, X, USD/USDA/USDC

## Файлы для исправления

- [x] `print_service/validators.py` - расширить валидатор расширений
- [x] `backend/api/v1/views/model_views.py` - расширить список поддерживаемых расширений
- [x] `print_service/services/conversion.py` - расширить SUPPORTED_EXTENSIONS и улучшить роутинг

## Требуемые расширения
```
.trimesh_formats = {".stl", ".obj", ".ply", ".glb", ".gltf"}
.blender_formats = {".fbx", ".dae", ".3ds", ".blend", ".3mf", ".x"}
.usd_formats = {".usd", ".usda", ".usdc"}
```

## Примечания
- Все файлы проходят проверку синтаксиса Python
- Обновлены документации в CONVERSION_ARCHITECTURE.md
