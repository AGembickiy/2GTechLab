# 2GTechLab Requirements

Этот каталог содержит файлы с зависимостями Python.

## Файлы

### `base.txt`
Базовые зависимости, используемые во всех окружениях:
- Django
- Django REST Framework
- PostgreSQL
- Redis/Celery
- 3D модели (trimesh, pymeshfix)
- API документация (drf-spectacular)

### `dev.txt`
Разработческие зависимости (включает base.txt):
- ipython, pdbpp
- django-extensions
- coverage
- pytest
- linters (flake8, black, isort)

### `prod.txt`
Продакшен зависимости (включает base.txt):
- whitenoise

## Использование

```bash
# Установка для разработки
pip install -r requirements/dev.txt

# Установка для продакшена
pip install -r requirements/prod.txt
```
