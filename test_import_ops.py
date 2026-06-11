import bpy
import os

print("=== Testing 3MF Import in Blender 5.1.2 ===")

# Создаем куб
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add(size=2)

# Экспортируем в STL
test_stl = "/tmp/test_cube.stl"
bpy.ops.export_mesh.stl(filepath=test_stl)
print(f"Exported STL to {test_stl}")

# Попытка импорта через разные операторы
print("\n=== Trying different import operators ===")

operators_to_try = [
    'import_mesh.stl',
    'import_mesh.threemf',
    'import_scene.threemf',
    'import_mesh.3mf',
    'import_scene.3mf',
]

for op_name in operators_to_try:
    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        
        # Разбиваем путь на module.operator
        parts = op_name.split('.')
        if len(parts) == 2:
            module, op = parts
            if hasattr(bpy.ops, module):
                module_obj = getattr(bpy.ops, module)
                if hasattr(module_obj, op):
                    print(f"\nTrying {op_name}...")
                    getattr(module_obj, op)(filepath=test_stl)
                    print(f"  SUCCESS: {op_name} worked!")
                    print(f"  Objects: {len(bpy.context.scene.objects)}")
        else:
            print(f"Invalid operator name: {op_name}")
    except Exception as e:
        print(f"  {op_name}: ERROR - {e}")
