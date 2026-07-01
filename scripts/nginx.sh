#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=== Запуск Gunicorn ==="

if [ ! -d "venv" ]; then
    echo "ERROR: venv not found. Run scripts/install.sh first."
    exit 1
fi

source venv/bin/activate

cd "$PROJECT_ROOT/backend"
gunicorn core.asgi:application --bind 0.0.0.0:8000 --workers 3
