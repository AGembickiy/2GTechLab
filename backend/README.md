# Django: расход материала, слайсинг, Moonraker

## Быстрый старт

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # при необходимости поправьте URL Moonraker
python manage.py migrate
python manage.py seed_materials
python manage.py runserver 0.0.0.0:8000
```

Celery (слайсинг в фоне):

```bash
# отдельный терминал, Redis должен быть запущен
celery -A config worker -l info
```

Переменные окружения см. `.env.example`.

## API

| Метод | Путь | Описание |
|--------|------|----------|
| GET | `/api/material-presets/` | Справочник материалов |
| POST | `/api/print-jobs/` | multipart: поле `original_file` |
| POST | `/api/print-jobs/{id}/slice/` | Запуск задачи Celery |
| GET | `/api/print-jobs/{id}/slot-assignments/` | Назначения слотов |
| POST | `/api/slot-assignments/` | `{ job_id, slot_index, material_preset_id }` |
| GET | `/api/moonraker/status/` | Прокси к Moonraker (мониторинг) |

## Режимы слайсера

- `SLICER_MODE=mock` (по умолчанию) — без OrcaSlicer, создаётся mock G-code и тестовые `SlotAssignment`.
- `SLICER_MODE=orca` — нужны `ORCASLICER_PATH`, `ORCASLICER_PROFILE` и JSON `_stats.json` в формате из вашего пайплайна.

## Moonraker

- HTTP: `MOONRAKER_API_URL` (например `http://127.0.0.1:7125`)
- Загрузка mock G-code на принтер: `MOONRAKER_UPLOAD_MOCK=1` вместе с `SLICER_MODE=mock`

WebSocket к Moonraker обычно подключается **с фронта** (`NUXT_PUBLIC_MOONRAKER_WS_URL`); HTTP-прокси нужен, чтобы не настраивать CORS к принтеру.
