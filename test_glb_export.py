import bpy
import os

print("=== Testing GLB Export ===")

# Создаем тестовый 3MF файл (куб)
bpy.ops.wm.read_factory_settings(use_empty=True)

# Создаем куб
bpy.ops.mesh.primitive_cube_add(size=2)

# Экспортируем в 3MF
test_3mf = "/tmp/test_cube.3mf"
try:
    bpy.ops.import_scene.threemf(filepath=test_3mf)
    print(f"Imported 3MF from {test_3mf}")
except FileNotFoundError:
    print(f"3MF file not found at {test_3mf}")
    # Создаем куб и экспортируем в 3MF через STL (костыль)
    print("Creating cube manually...")
    bpy.ops.mesh.primitive_cube_add(size=2)
    
    # Экспортируем в STL
    test_stl = "/tmp/test_cube.stl"
    bpy.ops.export_mesh.stl(filepath=test_stl)
    print(f"Exported STL to {test_stl}")
    
    # Импортируем STL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_mesh.stl(filepath=test_stl)
    print(f"Imported STL from {test_stl}")
    
    # Экспортируем в GLB
    test_glb = "/tmp/test_cube.glb"
    bpy.ops.export_scene.gltf(filepath=test_glb, export_format='GLB')
    print(f"Exported GLB to {test_glb}")
    print(f"GLB file exists: {os.path.exists(test_glb)}")
    print(f"GLB file size: {os.path.getsize(test_glb)} bytes")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
