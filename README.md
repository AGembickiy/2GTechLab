# 2GTechLab

## Весь стек одной командой (Nuxt + Django + Celery + Redis)

Из корня репозитория:

```bash
npm install
npm run dev:all
```

Поднимается: **Redis** (локальный `redis-server`, или **Docker** `redis:7-alpine`, или уже запущенный Redis на `:6379`), **Django** `:8000`, **Celery worker**, **Nuxt** `:3000`. Перед стартом выполняются **`migrate`** и **`seed_materials`**.

Если Docker установлен, но выдаёт **permission denied** к сокету — скрипт сам перейдёт в режим **`CELERY_EAGER=1`** (без Redis и без отдельного worker; фоновые задачи выполняются в процессе Django). Либо выполните `sudo usermod -aG docker "$USER"`, либо поставьте **`sudo apt install redis-server`**.

Переменные: `REDIS_PORT`, `CELERY_BROKER_URL` (см. `scripts/dev-all.sh`).

---

## Только фронтенд (Nuxt 3)

```bash
npm install
npm run dev
```

Открыть: http://localhost:3000

## Печать: Django + Celery + Moonraker

См. **`docs/PRINT_PIPELINE.md`** и **`backend/README.md`**.

Кратко:

1. Поднять Redis и Django (`backend/`).
2. Запустить Celery worker: `celery -A config worker -l info` из каталога `backend`.
3. В `apps/web` задать `NUXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api`.
4. Страница демо: **`/print/pipeline`**.
