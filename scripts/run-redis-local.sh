#!/usr/bin/env bash
set -euo pipefail
PORT="${REDIS_PORT:-6379}"
exec redis-server --port "$PORT" --save "" --appendonly no
