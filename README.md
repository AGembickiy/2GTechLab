## Платформа 3D‑печати

Этот репозиторий содержит монорепозиторий цифровой платформы для 3D‑печати:

- `web` — клиентское веб‑приложение на Next.js + React + Redux Toolkit.
- `api` — backend на Node.js + Express + GraphQL (Apollo Server).
- `docs` — документация (архитектура, схема БД, GraphQL‑схема, roadmap).

### Технологический стек

- **Frontend**: Next.js, React, Redux Toolkit, TypeScript.
- **Backend**: Node.js, Express, Apollo Server (GraphQL), TypeScript.
- **Базы данных**: PostgreSQL (основные реляционные данные), MongoDB (логирование и аналитика).
- **Кэш**: Redis.
- **Хранение файлов**: S3‑совместимое хранилище (AWS S3 / MinIO).
- **Оркестрация**: Docker, Kubernetes.

### Структура доменов

- Заказы и корзина.
- Магазин и каталог.
- Клиенты и CRM.
- Производство и планирование печати.
- Финансы и аналитика.
- Склад и материалы.
- Оборудование и обслуживание.
- Интеграции (платежи, логистика, CRM/ERP, маркетплейсы).

Подробности по архитектуре см. в `docs/architecture.md`.

### Запуск проекта

#### Вариант 1. Локальная разработка (без Docker)

```bash
# 1. Установить зависимости
cd api && npm install
cd ../web && npm install

# 2. Локальный dev-режим (из корня репозитория)
cd ..
npm run dev
```

- `web`: `http://localhost:3000`
- `api`: `http://localhost:4000/graphql`

Для работы Sanity укажите в `web/.env.local`:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SITE_URL` (опционально)

#### Вариант 2. Docker (prod-режим, web + api + Postgres)

В корне репозитория есть `docker-compose.yml`, который поднимает `web`, `api` и Postgres.

```bash
# запуск (prod-сборка + старт контейнеров)
npm run up

# либо с правами sudo, если докер требует
sudo npm run up
```

После запуска:

- `web`: `http://localhost:3000`
- `api`: `http://localhost:4000/graphql`

Остановить и удалить контейнеры:

```bash
npm run down
# или
sudo npm run down

# запустить проверки качества кода (ESLint + TypeScript для web и api)
npm run check
```

