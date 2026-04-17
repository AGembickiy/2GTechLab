#!/usr/bin/env bash
set -u

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DJANGO_PID=""
NUXT_PID=""

log_info() {
  echo -e "${BLUE}$1${NC}"
}

log_ok() {
  echo -e "${GREEN}$1${NC}"
}

log_warn() {
  echo -e "${YELLOW}$1${NC}"
}

log_err() {
  echo -e "${RED}$1${NC}"
}

safe_kill() {
  local pid="${1:-}"
  if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
    kill "${pid}" 2>/dev/null || true
    wait "${pid}" 2>/dev/null || true
  fi
}

cleanup() {
  log_info "Остановка сервисов..."
  safe_kill "${DJANGO_PID}"
  safe_kill "${NUXT_PID}"
}

on_interrupt() {
  cleanup
  exit 0
}

trap on_interrupt INT TERM
trap cleanup EXIT

log_info "Запуск 2GTechLab..."

if [ ! -f "manage.py" ]; then
  log_err "Скрипт нужно запускать из корня проекта (рядом с manage.py)."
  exit 1
fi

if [ ! -d "frontend" ]; then
  log_err "Не найдена директория frontend."
  exit 1
fi

log_info "Шаг 1: Python окружение и зависимости"
if [ -d "venv" ]; then
  # shellcheck disable=SC1091
  source "venv/bin/activate"
  log_ok "venv активирован."
else
  log_info "Создание venv..."
  python3 -m venv "venv"
  # shellcheck disable=SC1091
  source "venv/bin/activate"
  log_ok "venv создан и активирован."
fi

pip install -r "requirements.txt" || {
  log_err "Не удалось установить Python-зависимости."
  exit 1
}

log_info "Шаг 2: Миграции"
python3 manage.py migrate || {
  log_err "Миграции не применились."
  exit 1
}

log_info "Шаг 3: Frontend зависимости"
npm --prefix "frontend" install || {
  log_err "Не удалось установить npm-зависимости."
  exit 1
}

log_info "Шаг 4: Запуск серверов"
python3 manage.py runserver "0.0.0.0:8000" &
DJANGO_PID=$!
sleep 2
if ! kill -0 "${DJANGO_PID}" 2>/dev/null; then
  log_err "Django не запустился. Проверьте настройки (ALLOWED_HOSTS/DEBUG/SECRET_KEY)."
  exit 1
fi
log_ok "Django: http://127.0.0.1:8000"

npm --prefix "frontend" run dev -- -o &
NUXT_PID=$!
sleep 2
if ! kill -0 "${NUXT_PID}" 2>/dev/null; then
  log_err "Nuxt не запустился."
  exit 1
fi
log_ok "Nuxt: http://localhost:3000"

log_warn "Нажмите Ctrl+C для остановки обоих сервисов."

wait -n "${DJANGO_PID}" "${NUXT_PID}"
log_warn "Один из сервисов завершился. Останавливаю остальные."
exit 1
