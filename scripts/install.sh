#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=== Проверка Python ==="
command -v python3 >/dev/null 2>&1 || {
    echo "Python3 не найден"
    exit 1
}

echo "=== Создание виртуального окружения ==="
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate

echo "=== Обновление pip ==="
python -m pip install --upgrade pip

echo "=== Установка зависимостей ==="
if [ -f "requirements/dev.txt" ]; then
    pip install -r requirements/dev.txt
elif [ -f "requirements/base.txt" ]; then
    pip install -r requirements/base.txt
elif [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "Файл зависимостей не найден!"
    exit 1
fi

echo "=== Установка дополнительных зависимостей ==="
pip install django-environ

echo "=== Установка frontend зависимостей ==="
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd "$PROJECT_ROOT"
fi

echo "=== Установка завершена ==="
