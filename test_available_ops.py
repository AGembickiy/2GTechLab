import bpy
import os

print("=== Testing available operators in Blender 5.1.2 ===")

# Создаем куб
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add(size=2)

print("\n=== Mesh Export Operators ===")
for op in dir(bpy.ops.export_mesh):
    print(f"  - {op}")

print("\n=== Scene Export Operators ===")
for op in dir(bpy.ops.export_scene):
    print(f"  - {op}")

print("\n=== Mesh Import Operators ===")
for op in dir(bpy.ops.import_mesh):
    print(f"  - {op}")

print("\n=== Scene Import Operators ===")
for op in dir(bpy.ops.import_scene):
    print(f"  - {op}")
