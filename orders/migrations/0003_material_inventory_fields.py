from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0002_material_printer_remove_order_original_file_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="material",
            name="actual_weight_g",
            field=models.FloatField(default=0, verbose_name="Фактический остаток (г)"),
        ),
        migrations.AddField(
            model_name="material",
            name="manufacturer",
            field=models.CharField(blank=True, max_length=120, verbose_name="Производитель"),
        ),
        migrations.AddField(
            model_name="material",
            name="material_type",
            field=models.CharField(default="PLA", max_length=50, verbose_name="Тип материала"),
        ),
        migrations.AddField(
            model_name="material",
            name="min_weight_g",
            field=models.FloatField(default=0, verbose_name="Минимальный остаток (г)"),
        ),
        migrations.AddField(
            model_name="material",
            name="next_inventory_date",
            field=models.DateField(blank=True, null=True, verbose_name="Дата следующей инвентаризации"),
        ),
        migrations.AddField(
            model_name="material",
            name="previous_inventory_date",
            field=models.DateField(blank=True, null=True, verbose_name="Дата прошлой инвентаризации"),
        ),
    ]
