# 2G Tech Lab — Сайт мастерской 3D-печати

Современный сайт для мастерской 3D-печати на Next.js 16 с Sanity CMS.

## Возможности

- **Главная** — Hero, услуги, преимущества, портфолио, отзывы
- **Каталог** — товары с фильтрами (категория, материал, цена)
- **Портфолио** — интерактивная «куча фото» (клик выводит карточку на передний план)
- **Блог** — статьи с Portable Text
- **FAQ** — аккордеон с поиском
- **Контакты** — форма обратной связи, карта (заглушка)
- **SEO** — sitemap, robots.txt, метаданные
- **CMS** — Sanity Studio на `/studio` для управления контентом

## Быстрый старт

```bash
cd web
npm install --legacy-peer-deps
cp .env.local.example .env.local
# Отредактируйте .env.local — укажите NEXT_PUBLIC_SANITY_PROJECT_ID и NEXT_PUBLIC_SANITY_DATASET
npm run dev
```

Сайт: http://localhost:3000  
CMS: http://localhost:3000/studio

## Настройка Sanity

1. Создайте проект на [sanity.io/manage](https://www.sanity.io/manage)
2. Скопируйте Project ID и Dataset в `.env.local`
3. При первом заходе на `/studio` выполните вход через Sanity
4. Заполните контент: услуги, товары, портфолио, FAQ, отзывы, настройки сайта

## Без Sanity

Сайт работает и без Sanity — используется демо-контент из `src/lib/mockData.ts`. Для production настройте Sanity и добавьте реальные данные.

## Форма обратной связи

API-маршрут `/api/contact` принимает POST с полями `name`, `email`, `message`. Для отправки email добавьте Resend, SendGrid или Nodemailer (см. комментарии в `src/app/api/contact/route.ts`).

## Деплой на Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
3. При необходимости — `NEXT_PUBLIC_SITE_URL` для sitemap

## Технологии

- Next.js 16 (App Router)
- Tailwind CSS 4
- Sanity CMS
- Framer Motion
- React Hook Form + Zod
