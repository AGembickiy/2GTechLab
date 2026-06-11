import bpy

print("=== Blender Importers Check ===")
print("\nMesh importers:")
for op in dir(bpy.ops.import_mesh):
    print(f"  - {op}")

print("\nScene importers:")
for op in dir(bpy.ops.import_scene):
    print(f"  - {op}")

# Проверка 3MF
print("\n=== Testing 3MF import ===")
try:
    print(f"Has import_mesh.threemf: {hasattr(bpy.ops.import_mesh, 'threemf')}")
    print(f"Has import_scene.threemf: {hasattr(bpy.ops.import_scene, 'threemf')}")
except Exception as e:
    print(f"Error: {e}")
