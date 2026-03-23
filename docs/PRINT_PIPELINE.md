# Конвейер печати: Nuxt + Django + Celery + Moonraker

## Что добавлено в репозиторий

1. **`backend/`** — Django 4+, DRF, модели `MaterialPreset`, `PrintJob`, `Surface`, `SlotAssignment`, Celery-задача `slice_and_analyze_task`, HTTP-клиент Moonraker, прокси `GET /api/moonraker/status/`.
2. **`apps/web/composables/usePrintApi.ts`** — клиент REST API (создание job, слайсинг, слоты).
3. **`apps/web/composables/useMoonrakerWS.ts`** — опрос статуса через Django и/или WebSocket Moonraker.
4. **`apps/web/pages/print/pipeline.vue`** — демо-страница: загрузка файла → запуск слайсинга → мониторинг.

## Запуск

### Терминал 1 — Redis (для Celery)

```bash
redis-server
```

### Терминал 2 — Django

См. `backend/README.md`: `migrate`, `seed_materials`, `runserver :8000`.

### Терминал 3 — Celery worker

```bash
cd backend && source .venv/bin/activate
celery -A config worker -l info
```

### Терминал 4 — Nuxt

```bash
cd apps/web && npm run dev
```

Откройте: **http://localhost:3000/print/pipeline**

Переменные: скопируйте `apps/web/.env.example` → `apps/web/.env` и при необходимости задайте `NUXT_PUBLIC_MOONRAKER_WS_URL`.

## Отличия от вставленного вами черновика

- Вместо Vuex используется **`useState` / composables** (Nuxt 3).
- Код Moonraker приведён к типичным HTTP-путям; при несовпадении версии Klipper/Moonraker поправьте `print_service/services/moonraker.py`.
- Слайсинг по умолчанию **`SLICER_MODE=mock`** (без OrcaSlicer), чтобы пайплайн работал без бинарника.
- Компонент `SurfaceSelectionModal.vue` из примера **не дублировался целиком** — 3D-редактор у вас уже в `FileUpload.vue`; при необходимости свяжите его с `POST /api/slot-assignments/` и `job_id` из Django.

## Следующие шаги (продакшен)

- Авторизация пользователей и привязка `PrintJob.user`.
- Реальный экспорт статистики из OrcaSlicer/Bambu в JSON для `tasks.py`.
- Очередь печати и идемпотентность загрузки G-code в Moonraker.
