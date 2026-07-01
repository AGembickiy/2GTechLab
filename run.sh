#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Параметры запуска
SKIP_INSTALL=${1:-"false"}
SKIP_MIGRATE=${2:-"false"}

echo "=== Запуск 2GTechLab ==="
echo "  Пропустить установку: $SKIP_INSTALL (по умолчанию: false)"
echo "  Пропустить миграции: $SKIP_MIGRATE (по умолчанию: false)"
echo ""
echo "Использование: ./run.sh [skip_install] [skip_migrate]"
echo "  skip_install: true/false - пропустить установку зависимостей (по умолчанию: false)"
echo "  skip_migrate: true/false - пропустить применение миграций (по умолчанию: false)"

if [ "$SKIP_INSTALL" = "false" ]; then
    echo "=== Запуск установки зависимостей ==="
    "$ROOT_DIR/scripts/install.sh"
fi

if [ "$SKIP_MIGRATE" = "false" ]; then
    echo "=== Запуск миграций ==="
    source venv/bin/activate
    "$ROOT_DIR/scripts/migrate.sh"
fi

echo "=== Запуск backend ==="
source venv/bin/activate
"$ROOT_DIR/scripts/backend.sh" > /tmp/backend.log 2>&1 &
BACK_PID=$!

echo "=== Запуск frontend ==="
"$ROOT_DIR/scripts/frontend.sh" > /tmp/frontend.log 2>&1 &
FRONT_PID=$!

echo "=== Все процессы запущены ==="
echo "Backend PID: $BACK_PID"
echo "Frontend PID: $FRONT_PID"

cleanup() {
    echo "Завершение процессов..."
    kill $BACK_PID 2>/dev/null || true
    kill $FRONT_PID 2>/dev/null || true
    pkill -f "manage.py runserver" 2>/dev/null || true
    pkill -f "celery" 2>/dev/null || true
    pkill -f "nuxt dev" 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM EXIT

# Ждем завершения фоновых процессов
wait $BACK_PID $FRONT_PID
