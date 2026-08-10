#!/usr/bin/env bash

set -Eeuo pipefail

###############################################################################
# 2GTechLab
###############################################################################

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
LOG_DIR="$ROOT_DIR/logs"

FRONT_PID=""
BACK_PID=""

BLUE="\033[0;34m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

###############################################################################
# LOG
###############################################################################

info() {
    echo -e "${BLUE}[INFO]${RESET} $*"
}

ok() {
    echo -e "${GREEN}[SUCCESS]${RESET} $*"
}

warn() {
    echo -e "${YELLOW}[WARNING]${RESET} $*"
}

err() {
    echo -e "${RED}[ERROR]${RESET} $*"
}

###############################################################################
# CHECKS
###############################################################################

require() {
    command -v "$1" >/dev/null 2>&1 || {
        err "Не найдена команда: $1"
        exit 1
    }
}

check_environment() {

    require bash
    require node
    require npm

    [[ -d "$FRONTEND_DIR" ]] || {
        err "Не найдена папка frontend"
        exit 1
    }

    [[ -f "$FRONTEND_DIR/package.json" ]] || {
        err "Не найден frontend/package.json"
        exit 1
    }

    mkdir -p "$LOG_DIR"
}

###############################################################################
# INSTALL
###############################################################################

install_frontend() {

    info "Проверка зависимостей frontend..."

    cd "$FRONTEND_DIR"

    if [[ ! -d node_modules ]]; then
        npm install
    fi

    ok "Frontend готов"

    cd "$ROOT_DIR"
}

###############################################################################
# WAIT
###############################################################################

wait_port() {

    local port="$1"

    for ((i=1;i<=60;i++)); do

        if curl -fs "http://localhost:${port}" >/dev/null 2>&1; then
            return 0
        fi

        sleep 1

    done

    return 1
}

###############################################################################
# START FRONTEND
###############################################################################

start_frontend() {

    info "Запуск frontend..."

    cd "$FRONTEND_DIR"

    npm run dev >"$LOG_DIR/frontend.log" 2>&1 &

    FRONT_PID=$!

    cd "$ROOT_DIR"

    if ! kill -0 "$FRONT_PID" 2>/dev/null; then
        err "Nuxt завершился сразу после запуска."
        exit 1
    fi

    info "Ожидание запуска Nuxt..."

    if wait_port 3000; then

        ok "Frontend успешно запущен"

    else

        err "Frontend не смог запуститься."

        echo
        echo "Последние строки frontend.log:"
        echo

        tail -40 "$LOG_DIR/frontend.log"

        exit 1

    fi
}

###############################################################################
# BACKEND
###############################################################################

start_backend() {

    if [[ ! -d "$BACKEND_DIR" ]]; then
        warn "Backend отсутствует"
        return
    fi

    if [[ ! -f "$BACKEND_DIR/package.json" ]]; then
        warn "Backend отсутствует"
        return
    fi

    info "Запуск backend..."

    cd "$BACKEND_DIR"

    npm run dev >"$LOG_DIR/backend.log" 2>&1 &

    BACK_PID=$!

    cd "$ROOT_DIR"

    ok "Backend запущен"
}

###############################################################################
# STOP
###############################################################################

cleanup() {

    echo

    info "Остановка проекта..."

    if [[ -n "$FRONT_PID" ]]; then

        if kill -0 "$FRONT_PID" 2>/dev/null; then

            kill "$FRONT_PID"

            wait "$FRONT_PID" 2>/dev/null || true

        fi

    fi

    if [[ -n "$BACK_PID" ]]; then

        if kill -0 "$BACK_PID" 2>/dev/null; then

            kill "$BACK_PID"

            wait "$BACK_PID" 2>/dev/null || true

        fi

    fi

    ok "Все процессы остановлены"
}

###############################################################################
# MAIN
###############################################################################

main() {

    trap cleanup EXIT INT TERM

    echo
    echo "=========================================="
    echo "        2GTechLab"
    echo "=========================================="
    echo

    check_environment

    install_frontend

    start_frontend

    start_backend

    echo
    echo "=========================================="
    echo "Frontend : http://localhost:3000"

    if [[ -n "$BACK_PID" ]]; then
        echo "Backend  : http://localhost:8000"
    fi

    echo
    echo "Logs      : $LOG_DIR"
    echo "Ctrl+C    : остановить проект"
    echo "=========================================="
    echo

    wait "$FRONT_PID"

}

main "$@"
