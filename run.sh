#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "================================="
echo "  2GTechLab Startup Script"
echo "================================="

cd "$ROOT_DIR"

if [ ! -d "venv" ]; then
    echo "ERROR: venv not found"
    echo "Create virtual environment first:"
    echo "python3 -m venv venv"
    exit 1
fi

source venv/bin/activate

echo ""
echo "[1/7] Updating pip..."
python -m pip install --upgrade pip

echo ""
echo "[2/7] Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "[3/7] Running Django checks..."
python manage.py check

echo ""
echo "[4/7] Running migrations..."
python manage.py migrate

echo ""
echo "[5/7] Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "[6/7] Starting Django..."

python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

echo "Django PID: $DJANGO_PID"

cd frontend

if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "[7/7] Starting Nuxt..."

npm run dev &
NUXT_PID=$!

echo "Nuxt PID: $NUXT_PID"

cleanup() {
    echo ""
    echo "Stopping services..."

    kill $DJANGO_PID 2>/dev/null || true
    kill $NUXT_PID 2>/dev/null || true

    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "================================="
echo "Backend : http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "================================="

wait