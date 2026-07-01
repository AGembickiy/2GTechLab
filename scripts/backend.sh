#!/usr/bin/env bash

# Не используем set -e, чтобы фоновые процессы не блокировали выполнение

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Активация виртуального окружения
if [ ! -f "venv/bin/activate" ]; then
    echo "ERROR: venv not found. Run scripts/install.sh first."
    exit 1
fi

source venv/bin/activate

echo "=== Запуск Django ==="
echo "=== Проверка миграций ==="
python manage.py check

echo "=== Запуск Django development server ==="
python manage.py runserver 0.0.0.0:8000 > /tmp/django.log 2>&1 &
DJANGO_PID=$!
echo "Django process started with PID: $DJANGO_PID"

echo "=== Запуск Celery worker (опционально) ==="
celery -A backend worker --loglevel=info > /tmp/celery.log 2>&1 &
CELERY_PID=$!
echo "Celery process started with PID: $CELERY_PID"

# Ждем завершения Django
wait $DJANGO_PID

# При завершении Django завершаем Celery
kill $CELERY_PID 2>/dev/null || true
