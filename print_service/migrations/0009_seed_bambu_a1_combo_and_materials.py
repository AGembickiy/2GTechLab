from django.db import migrations


def seed_bambu_and_materials(apps, schema_editor):
    Equipment = apps.get_model("print_service", "Equipment")
    Material = apps.get_model("print_service", "Material")
    EquipmentMaterial = apps.get_model("print_service", "EquipmentMaterial")
    MaterialPreset = apps.get_model("print_service", "MaterialPreset")

    bambu, _ = Equipment.objects.get_or_create(
        name="Bambu Lab A1 Combo",
        defaults={
            "max_temp": 300,
            "build_volume_m3": 0.016777216,  # 256x256x256 mm
        },
    )

    material_rows = [
        {"name": "PLA", "temp_range_min": 190, "temp_range_max": 230, "color_hex": "#FFFFFF"},
        {"name": "PETG", "temp_range_min": 220, "temp_range_max": 260, "color_hex": "#9CA3AF"},
        {"name": "ABS", "temp_range_min": 230, "temp_range_max": 270, "color_hex": "#111827"},
        {"name": "TPU", "temp_range_min": 210, "temp_range_max": 240, "color_hex": "#3B82F6"},
    ]
    for row in material_rows:
        mat, _ = Material.objects.get_or_create(name=row["name"], defaults=row)
        EquipmentMaterial.objects.get_or_create(equipment=bambu, material=mat)

    preset_rows = [
        {"name": "PLA White", "type": "PLA", "color_hex": "#FFFFFF", "density_g_per_cm3": 1.24, "price_per_kg": "2200.00"},
        {"name": "PLA Black", "type": "PLA", "color_hex": "#000000", "density_g_per_cm3": 1.24, "price_per_kg": "2200.00"},
        {"name": "PETG Gray", "type": "PETG", "color_hex": "#00FFFF", "density_g_per_cm3": 1.27, "price_per_kg": "2600.00"},
        {"name": "ABS Red", "type": "ABS", "color_hex": "#FF0000", "density_g_per_cm3": 1.04, "price_per_kg": "2800.00"},
    ]
    for row in preset_rows:
        MaterialPreset.objects.get_or_create(name=row["name"], defaults=row)


def unseed_bambu_and_materials(apps, schema_editor):
    Equipment = apps.get_model("print_service", "Equipment")
    Material = apps.get_model("print_service", "Material")
    MaterialPreset = apps.get_model("print_service", "MaterialPreset")

    MaterialPreset.objects.filter(name__in=["PLA White", "PLA Black", "PETG Gray", "ABS Red"]).delete()
    Equipment.objects.filter(name="Bambu Lab A1 Combo").delete()
    Material.objects.filter(name__in=["PLA", "PETG", "ABS", "TPU"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("print_service", "0008_printjob_converted_3mf"),
    ]

    operations = [
        migrations.RunPython(seed_bambu_and_materials, unseed_bambu_and_materials),
    ]
