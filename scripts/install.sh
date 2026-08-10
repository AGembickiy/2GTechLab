#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" ) && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=== Проверка Node.js и npm ==="
command -v node >/dev/null 2>&1 || {
    echo "Node.js не найден"
    exit 1
}
command -v npm >/dev/null 2>&1 || {
    echo "npm не найден"
    exit 1
}

echo "=== Установка frontend зависимостей ==="
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd "$PROJECT_ROOT"
fi

echo "=== Установка завершена ==="
