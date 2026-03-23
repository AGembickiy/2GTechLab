#!/usr/bin/env bash
# Одна команда: Redis (при необходимости) + Django + Celery + Nuxt
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REDIS_PORT="${REDIS_PORT:-6379}"
export REDIS_PORT
REDIS_CONTAINER_NAME="${REDIS_CONTAINER_NAME:-2gt-dev-redis}"

port_busy() {
  (echo >/dev/tcp/127.0.0.1/"$REDIS_PORT") >/dev/null 2>&1
}

docker_usable() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

REDIS_EXTRA_SLOT=""
CELERY_EAGER_MODE=""
cleanup_docker_redis() {
  docker rm -f "$REDIS_CONTAINER_NAME" >/dev/null 2>&1 || true
}

if port_busy; then
  echo "[dev-all] Redis уже слушает 127.0.0.1:$REDIS_PORT — ок."
elif command -v redis-server >/dev/null 2>&1; then
  echo "[dev-all] Redis будет отдельным процессом (порт $REDIS_PORT)."
  REDIS_EXTRA_SLOT="1"
elif docker_usable; then
  echo "[dev-all] Поднимаю Redis в Docker ($REDIS_CONTAINER_NAME)..."
  cleanup_docker_redis
  docker run -d --name "$REDIS_CONTAINER_NAME" -p "${REDIS_PORT}:6379" redis:7-alpine
  trap cleanup_docker_redis EXIT INT TERM
  for _ in $(seq 1 60); do
    port_busy && break
    sleep 0.15
  done
  if ! port_busy; then
    echo "[dev-all] Ошибка: Redis не ответил на порту $REDIS_PORT." >&2
    exit 1
  fi
  echo "[dev-all] Redis (Docker) готов."
elif command -v docker >/dev/null 2>&1 && ! docker info >/dev/null 2>&1; then
  echo "[dev-all] Docker установлен, но нет доступа к сокету (permission denied)." >&2
  echo "  Варианты:" >&2
  echo "    • sudo usermod -aG docker \"\$USER\"  → перелогиниться" >&2
  echo "    • sudo apt install redis-server       → затем снова npm run dev:all" >&2
  echo "[dev-all] Продолжаю без Redis: CELERY_EAGER=1 (слайсинг в процессе Django, отдельный worker не нужен)."
  echo ""
  export CELERY_EAGER=1
  CELERY_EAGER_MODE="1"
else
  echo "[dev-all] Redis не найден (нет redis-server и рабочего Docker)." >&2
  echo "  Установите: sudo apt install redis-server" >&2
  echo "[dev-all] Продолжаю без Redis: CELERY_EAGER=1."
  echo ""
  export CELERY_EAGER=1
  CELERY_EAGER_MODE="1"
fi

echo ""

if [[ ! -d backend/.venv ]]; then
  echo "[dev-all] Создаю backend/.venv..."
  python3 -m venv backend/.venv
  backend/.venv/bin/pip install -q -r backend/requirements.txt
  echo ""
fi

if [[ ! -d apps/web/node_modules ]]; then
  echo "[dev-all] npm install в apps/web..."
  (cd apps/web && npm install)
  echo ""
fi

if [[ ! -d node_modules ]] || [[ ! -f node_modules/concurrently/package.json ]]; then
  echo "[dev-all] npm install в корне..."
  npm install
  echo ""
fi

echo "[dev-all] Миграции Django и пресеты материалов..."
(
  cd "$ROOT/backend"
  # shellcheck disable=SC1091
  source .venv/bin/activate
  export CELERY_EAGER="${CELERY_EAGER:-0}"
  python manage.py migrate --noinput
  python manage.py seed_materials
)
echo ""

if [[ "${CELERY_EAGER:-0}" != "1" ]]; then
  export CELERY_BROKER_URL="${CELERY_BROKER_URL:-redis://127.0.0.1:${REDIS_PORT}/0}"
  export CELERY_RESULT_BACKEND="${CELERY_RESULT_BACKEND:-$CELERY_BROKER_URL}"
fi

chmod +x "$ROOT/scripts/run-django.sh" "$ROOT/scripts/run-celery.sh" "$ROOT/scripts/run-web.sh" "$ROOT/scripts/run-redis-local.sh" 2>/dev/null || true

CONCURRENTLY="$ROOT/node_modules/.bin/concurrently"
[[ -x "$CONCURRENTLY" ]] || CONCURRENTLY="npx concurrently"

# Передаём CELERY_EAGER дочерним процессам (Django)
export CELERY_EAGER

if [[ -n "$CELERY_EAGER_MODE" ]]; then
  echo "[dev-all] Запуск: django + nuxt (без процесса celery worker)."
  exec "$CONCURRENTLY" -k \
    -c green,cyan \
    -n django,web \
    "$ROOT/scripts/run-django.sh" \
    "$ROOT/scripts/run-web.sh"
fi

if [[ -n "$REDIS_EXTRA_SLOT" ]]; then
  exec "$CONCURRENTLY" -k \
    -c blue,green,magenta,cyan \
    -n redis,django,celery,web \
    "$ROOT/scripts/run-redis-local.sh" \
    "$ROOT/scripts/run-django.sh" \
    "$ROOT/scripts/run-celery.sh" \
    "$ROOT/scripts/run-web.sh"
fi

exec "$CONCURRENTLY" -k \
  -c green,magenta,cyan \
  -n django,celery,web \
  "$ROOT/scripts/run-django.sh" \
  "$ROOT/scripts/run-celery.sh" \
  "$ROOT/scripts/run-web.sh"
