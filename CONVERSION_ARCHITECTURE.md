# Архитектура конвертации 3D-моделей

## 🎯 Обзор

Система конвертации 3D-моделей построена по принципу **единый вход → внутренний формат GLB**.

```text
ANY 3D FORMAT (STL, OBJ, FBX, DAE, PLY, GLB)
   ↓
print_service/services/conversion.py (универсальный конвертер)
   ↓
GLB (внутренний формат)
   ↓
viewer / slicing / printing
```

## 🏗 Архитектура

### Уровни конвертации

1. **Trimesh** (быстрый, для базовых форматов)
   - STL, OBJ, PLY, GLB, GLTF
   - Легкий, без внешних зависимостей (кроме Python пакетов)
   - Быстрая конвертация

2. **Blender CLI** (универсальный, для сложных форматов)
   - FBX, DAE
   - Поддержка материалов, текстур, анимаций
   - Стабилен на сервере

3. **Fallback на ошибку**
   - Если trimesh не справляется, пробуем Blender
   - Если и Blender не работает, возвращаем ошибку с описанием

### Иерархия вызовов

```
try_prepare_model_assets(job)
├── Проверка расширения
├── Попытка 1: _convert_with_trimesh()  [для STL, OBJ, PLY, GLB, GLTF]
│   └── Если неуспех → перейти к попытке 2
├── Попытка 2: _convert_with_blender_wrapper()  [если Blender доступен]
│   └── Если неуспех → перейти к попытке 3
└── Попытка 3: _convert_with_trimesh()  [fallback для сложных форматов]
```

### Поддерживаемые форматы

| Формат | Метод | Примечание |
| ------ | ------ | ------ |
| STL | Trimesh | ✅ Быстро, без внешних зависимостей |
| OBJ | Trimesh | ✅ Поддерживается |
| PLY | Trimesh | ✅ Поддерживается |
| GLB | Trimesh | ✅ Поддерживается |
| GLTF | Trimesh | ✅ Поддерживается |
| FBX | Blender | ✅ Требует Blender CLI |
| DAE | Blender | ✅ Требует Blender CLI |
| 3DS | Blender | ✅ Требует Blender CLI |
| BLEND | Blender | ✅ Требует Blender CLI |
| 3MF | Blender | ✅ Требует Blender CLI (аддон 3MF может потребоваться) |
| X | Blender | ✅ Требует Blender CLI |
| USD | Trimesh | ✅ Поддерживается через USD API |
| USDA | Trimesh | ✅ Поддерживается через USD API |
| USDC | Trimesh | ✅ Поддерживается через USD API |

### CAD форматы (STEP, IGES)

**Требуют конвертации в CAD-программе.** Для импорта STEP/IGES необходима библиотека OpenCascade (OCCT), которая:

- Тяжелая (многие MB)
- Сложна в установке на сервер
- Требует компиляции C++ кода

**Рекомендация**: Добавьте на фронтенде предупреждение для пользователей:
> "Форматы STEP и IGES требуют конвертации. Пожалуйста, сохраните модель как STL, OBJ или FBX перед загрузкой."

## 🔧 Использование

### В Celery задачах

```python
from print_service.tasks import process_order
from print_service.services.conversion import try_prepare_model_assets

@shared_task
def convert_model_task(job_id):
    from print_service.models import PrintJob
    job = PrintJob.objects.get(pk=job_id)
    
    success, error = try_prepare_model_assets(job)
    
    if success:
        # Продолжаем обработку
        process_order(job_id)
    else:
        job.status = 'error'
        job.last_error = error
        job.save()
```

### В Django views

```python
from print_service.services.conversion import try_prepare_model_assets

def upload_view(request):
    if request.method == 'POST' and request.FILES.get('file'):
        job = PrintJob.objects.create(
            original_file=request.FILES['file'],
            user=request.user,
        )
        
        success, error = try_prepare_model_assets(job)
        
        if success:
            return JsonResponse({'status': 'success', 'job_id': job.pk})
        else:
            job.status = 'error'
            job.last_error = error
            job.save()
            return JsonResponse({'status': 'error', 'message': error}, status=400)
```

## 🛠 Требования

### Python пакеты

Уже установлены:
- `trimesh` - работа с 3D-моделями
- `pymeshfix` - автоматический ремонт геометрии
- `numpy` - численные расчеты

### Blender CLI

**Обязательно для форматов: FBX, DAE**

**Отключено:** 3MF, VRML (Blender 5.x не поддерживает импорт этих форматов)

#### Установка на Ubuntu/Debian

```bash
apt-get update
apt-get install blender
```

#### Установка на macOS

```bash
brew install blender
```

#### Установка на Windows

1. Скачайте Blender с [blender.org](https://www.blender.org/download/)
2. Распакуйте
3. Добавьте папку `bin` в переменную PATH:
   ```
   C:\Program Files\Blender Foundation\Blender\3.6\
   ```

#### Проверка установки

```bash
blender --version
# Должно вывести: Blender 5.x.x
```

## 🔍 Ошибки и диагностика

### Ошибка: "Blender CLI не установлен"

**Решение**: Установите Blender CLI (см. выше).

### Ошибка: "Критическая ошибка геометрии"

**Причина**: Модель негерметична и не может быть автоматически отремонтирована.

**Решение**: 
- Попросите пользователя исправить модель в CAD-программе
- Или используйте MeshLab для автоматического ремонта

### Ошибка: 415 Unsupported Media Type

**Причина**: Пользователь загрузил файл с неподдерживаемым форматом (например, STEP, IGES или 3MF).

**Решение**: Отобразить понятное сообщение пользователю о поддерживаемых форматах.

### Ошибка: 500 Internal Server Error

**Причина**: Произошла ошибка при конвертации файла (например, повреждённый файл или недостаточно ресурсов).

**Решение**: Логировать ошибку и сообщать пользователю, что файл повреждён.

## 📊 Производительность

| Формат | Время конвертации | Ресурсы |
| ------ | ------ | ------ |
| STL | ~0.1-0.3 сек | Минимальные |
| OBJ | ~0.2-0.5 сек | Минимальные |
| PLY | ~0.1-0.3 сек | Минимальные |
| GLB | ~0.1-0.2 сек | Минимальные |
| FBX | ~1-5 сек | Средние (Blender) |
| DAE | ~2-10 сек | Средние (Blender) |

## 🔐 Безопасность

- Временные скрипты Blender удаляются после использования
- Все файлы проверяются на размер и тип
- Ограничение времени конвертации (5 минут для Blender)
- Исключения обрабатываются и не раскрывают системную информацию

## 📝 История изменений

### v2.1 (текущая)
- ✅ Универсальный конвертер-оркестратор
- ✅ Поддержка Trimesh для базовых форматов (STL, OBJ, PLY, GLB, GLTF, USD, USDA, USDC)
- ✅ Поддержка Blender CLI для FBX/DAE/3DS/BLEND/3MF/X
- ✅ Поддержка USD конвертера для USD форматов
- ✅ Автоматический ремонт негерметичных моделей
- ✅ Единый выходной формат GLB
- ✅ Расширение поддерживаемых форматов до 17+ форматов
- ✅ Правильная обработка ошибок (415 для неподдерживаемых форматов, 500 для ошибок конвертации)

### v2.0
- ✅ Универсальный конвертер-оркестратор
- ✅ Поддержка Trimesh для базовых форматов (STL, OBJ, PLY, GLB, GLTF)
- ✅ Поддержка Blender CLI для FBX/GLB/GLTF
- ✅ Автоматический ремонт негерметичных моделей
- ✅ Единый выходной формат GLB
- ⚠️ 3MF и VRML временно отключены (Blender 5.x не поддерживает импорт)
- ✅ Правильная обработка ошибок (415 для неподдерживаемых форматов, 500 для ошибок конвертации)

### v1.0 (старая)
- ✅ Только STL через Trimesh
- ❌ Нет поддержки FBX/OBJ/DAE
