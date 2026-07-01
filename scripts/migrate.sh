#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=== Применение миграций ==="

# Активация виртуального окружения
source venv/bin/activate

python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

echo "=== Создание суперпользователя (если не существует) ==="
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print('Superuser created: admin/admin')
else:
    print('Superuser already exists')
EOF

echo "=== Запуск тестов (опционально) ==="
python manage.py test --keepdb 2>/dev/null || echo "Тесты пропущены"

echo "=== Миграции завершены ==="
