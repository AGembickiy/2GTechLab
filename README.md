## Платформа 3D‑печати

Этот репозиторий содержит монорепозиторий цифровой платформы для 3D‑печати:

- `web` — клиентское веб‑приложение на Next.js + React + Redux Toolkit.
- `api` — backend на Node.js + Express + GraphQL (Apollo Server).
- `infrastructure` — инфраструктурные артефакты (Docker, Kubernetes, CI/CD).
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

