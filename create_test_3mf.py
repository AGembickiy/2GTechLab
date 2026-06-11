import zipfile
import tempfile
import os
from xml.etree import ElementTree as ET

# Создаем простой 3MF файл (треугольник)
# 3MF - это ZIP архив с определенной структурой

def create_simple_3mf():
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, "test.3mf")
    
    with zipfile.ZipFile(zip_path, 'w') as zf:
        # Создаем MainModel.xml
        root = ET.Element("Model")
        root.set("xmlns", "http://schemas.microsoft.com/3dcommerce/3dml/2011/10")
        
        resources = ET.SubElement(root, "Resources")
        mesh = ET.SubElement(resources, "Mesh")
        mesh.set("ID", "0")
        
        vertices = ET.SubElement(mesh, "Vertices")
        
        v1 = ET.SubElement(vertices, "Vertex")
        v1.set("x", "0.0")
        v1.set("y", "0.0")
        v1.set("z", "0.0")
        
        v2 = ET.SubElement(vertices, "Vertex")
        v2.set("x", "1.0")
        v2.set("y", "0.0")
        v2.set("z", "0.0")
        
        v3 = ET.SubElement(vertices, "Vertex")
        v3.set("x", "0.0")
        v3.set("y", "1.0")
        v3.set("z", "0.0")
        
        triangles = ET.SubElement(mesh, "Triangles")
        
        t1 = ET.SubElement(triangles, "Triangle")
        t1.set("v1", "0")
        t1.set("v2", "1")
        t1.set("v3", "2")
        
        # Добавляем связи
        object_elem = ET.SubElement(root, "Objects")
        component = ET.SubElement(object_elem, "Object")
        component.set("ID", "1")
        component.set("Type", "model")
        
        components = ET.SubElement(component, "Components")
        component_child = ET.SubElement(components, "Component")
        component_child.set("ObjectID", "0")
        
        # Write to zip
        zf.writestr("3D/3DModel.model", ET.tostring(root, encoding="unicode"))
        
        # Создаем thumbnails
        zf.writestr("Metadata/Thumbnail.png", b"")
        
        # Создаем ContentType.xml
        content_types = ET.Element("Types", xmlns="http://schemas.openxmlformats.org/package/2006/content-types")
        default = ET.SubElement(content_types, "Default", Extension="model", ContentType="application/vnd.ms-package.3dmanufacturing")
        zf.writestr("[Content_Types].xml", ET.tostring(content_types, encoding="unicode"))
    
    return zip_path

if __name__ == "__main__":
    zip_path = create_simple_3mf()
    print(f"Created 3MF file: {zip_path}")
    print(f"File size: {os.path.getsize(zip_path)} bytes")
    
    # Проверяем, можно ли загрузить через trimesh
    try:
        import trimesh
        mesh = trimesh.load(zip_path, force="mesh")
        print(f"Trimesh loaded successfully: {mesh}")
        print(f"Is watertight: {mesh.is_watertight}")
    except Exception as e:
        print(f"Trimesh error: {e}")
