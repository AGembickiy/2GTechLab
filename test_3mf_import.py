import bpy
import os

# Создаем тестовый 3MF файл (куб)
bpy.ops.wm.read_factory_settings(use_empty=True)

# Создаем куб
bpy.ops.mesh.primitive_cube_add(size=2)

# Экспортируем в 3MF
test_3mf = "/tmp/test_export.3mf"
try:
    bpy.ops.export_scene.threemf(filepath=test_3mf)
    print(f"Successfully exported 3MF to {test_3mf}")
    print(f"File exists: {os.path.exists(test_3mf)}")
    print(f"File size: {os.path.getsize(test_3mf)} bytes")
except Exception as e:
    print(f"Error exporting 3MF: {e}")

# Теперь пробуем импортировать
test_3mf_import = "/tmp/test_import.3mf"
try:
    # Сначала экспортируем существующий
    bpy.ops.export_scene.threemf(filepath=test_3mf_import)
    
    # Затем удаляем сцену и импортируем обратно
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.threemf(filepath=test_3mf_import)
    print(f"Successfully imported 3MF from {test_3mf_import}")
    print(f"Objects in scene: {len(bpy.context.scene.objects)}")
except Exception as e:
    print(f"Error importing 3MF: {e}")
    import traceback
    traceback.print_exc()
