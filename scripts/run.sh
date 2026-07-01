#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=== Запуск установки зависимостей ==="
"$SCRIPT_DIR/install.sh"

echo "=== Запуск миграций ==="
"$SCRIPT_DIR/migrate.sh"

echo "=== Запуск backend ==="
"$SCRIPT_DIR/backend.sh" &
BACK_PID=$!

echo "=== Запуск frontend ==="
"$SCRIPT_DIR/frontend.sh" &
FRONT_PID=$!

cleanup() {
    echo "Завершение процессов..."
    kill $BACK_PID 2>/dev/null || true
    kill $FRONT_PID 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM

wait
