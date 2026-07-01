#!/usr/bin/env bash

# Не используем set -e, чтобы фоновые процессы не блокировали выполнение

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=== Запуск Nuxt (Frontend) ==="
cd frontend

if [ ! -d "node_modules" ]; then
    echo "ERROR: node_modules not found. Run scripts/install.sh first."
    exit 1
fi

# Проверка окружения
if [ "$NODE_ENV" = "production" ]; then
    echo "=== Сборка продакшн версии ==="
    npm run build
    npm run start
else
    echo "=== Запуск в режиме разработки ==="
    # Запускаем в фоновом режиме
    npm run dev > /tmp/frontend.log 2>&1 &
    DEV_PID=$!
    echo "Frontend process started with PID: $DEV_PID"
    # Ждем завершения nuxt dev
    wait $DEV_PID
fi
