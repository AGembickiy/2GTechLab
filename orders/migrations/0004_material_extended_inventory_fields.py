from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_material_inventory_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='category',
            field=models.CharField(
                choices=[
                    ('filament', 'Материалы (филаменты)'),
                    ('consumable', 'Расходные материалы'),
                    ('packaging', 'Упаковочные материалы'),
                ],
                default='filament',
                max_length=20,
                verbose_name='Категория',
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='delivery_date',
            field=models.DateField(blank=True, null=True, verbose_name='Дата поставки'),
        ),
        migrations.AddField(
            model_name='material',
            name='expiration_date',
            field=models.DateField(blank=True, null=True, verbose_name='Срок годности'),
        ),
        migrations.AddField(
            model_name='material',
            name='filament_diameter_mm',
            field=models.FloatField(blank=True, null=True, verbose_name='Диаметр нити (мм)'),
        ),
        migrations.AddField(
            model_name='material',
            name='filament_length_m',
            field=models.FloatField(blank=True, null=True, verbose_name='Длина нити (м)'),
        ),
        migrations.AddField(
            model_name='material',
            name='notes',
            field=models.TextField(blank=True, verbose_name='Примечания'),
        ),
        migrations.AddField(
            model_name='material',
            name='print_temperature_c',
            field=models.IntegerField(blank=True, null=True, verbose_name='Температура печати (°C)'),
        ),
        migrations.AddField(
            model_name='material',
            name='purchase_price',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
                verbose_name='Цена закупки',
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='spool_weight_g',
            field=models.FloatField(blank=True, null=True, verbose_name='Вес катушки (г)'),
        ),
        migrations.AddField(
            model_name='material',
            name='supplier',
            field=models.CharField(blank=True, max_length=150, verbose_name='Поставщик'),
        ),
    ]
