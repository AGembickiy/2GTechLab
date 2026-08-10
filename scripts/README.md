# 2GTechLab Scripts (Frontend only)

Этот каталог содержит скрипты запуска и управления проектом.

## Доступные скрипты

### `install.sh`
Установка frontend зависимостей:
- Проверка Node.js и npm
- Установка frontend-зависимостей (npm install)

### `frontend.sh`
Запуск Nuxt frontend на `http://localhost:3000`

## Использование

```bash
# Запуск всего проекта
./run.sh

# Или по отдельности
./scripts/install.sh
./scripts/frontend.sh
```

## Окружение

Корневой файл `.env` содержит переменные окружения для конфигурации.
