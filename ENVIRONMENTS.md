# Управление окружениями

Проект поддерживает множественные окружения через переменные окружения в `.env` файлах.

## 🏠 Топология сети

```
Домашняя сеть (192.168.1.0/24)
│
├── Desktop (192.168.1.13)      ← Development окружение
│   └── recording_life_dev-*
│
├── Server (192.168.1.72)       ← Production окружение
│   ├── recording_life_prod-*
│   └── forgejo-runner-alpine
│
├── Phone (192.168.1.2)         ← Клиент
│
└── Orange Pi (192.168.1.14)    ← Клиент (Кухня + TV)
```

## 📁 Файлы окружений

| Файл | Где используется | Коммитится в Git |
|------|------------------|------------------|
| `.env.example` | Шаблон для новых окружений | ✅ Да |
| `.env.development` | Desktop (192.168.1.13) | ❌ Нет (.gitignore) |
| `.env.production` | Server (192.168.1.72) | ❌ Нет (.gitignore) |
| `.env` | Симлинк на активное окружение | ❌ Нет (.gitignore) |

## 🚀 Быстрый старт

### На Desktop (Development)

```bash
# Перейдите в проект
cd ~/WORKSPACE/recording_life_system

# Файл .env.development уже создан с правильными настройками
# Проверьте настройки
cat .env.development

# Запустите development окружение
docker compose --env-file=.env.development up -d

# Или создайте симлинк
ln -sf .env.development .env
docker compose up -d

# Доступ:
# - Frontend: http://192.168.1.13:3000
# - Backend: http://192.168.1.13:8000
```

### На Server (Production)

```bash
# Перейдите в проект на сервере
cd ~/recording_life_system

# Файл .env.production уже создан с правильными настройками
# Проверьте настройки
cat .env.production

# Запустите production окружение
docker compose --env-file=.env.production up -d --build

# Или создайте симлинк
ln -sf .env.production .env
docker compose up -d --build

# Доступ:
# - Frontend: http://192.168.1.72:3000
# - Backend: http://192.168.1.72:8000
```

## ⚙️ Переменные окружения

### Обязательные

| Переменная | Development | Production | Описание |
|------------|-------------|------------|----------|
| `HOST_IP` | 192.168.1.13 | 192.168.1.72 | IP адрес хоста |
| `HOST_NAME` | desktop | server | Имя хоста |
| `ENVIRONMENT` | development | production | Окружение |
| `VITE_API_URL` | http://192.168.1.13:8000 | http://192.168.1.72:8000 | URL API |
| `VITE_WS_URL` | ws://192.168.1.13:8000/ws | ws://192.168.1.72:8000/ws | WebSocket URL |

### Опциональные (с дефолтами)

| Переменная | Дефолт | Описание |
|------------|---------|----------|
| `BACKEND_PORT` | 8000 | Порт backend |
| `FRONTEND_PORT` | 3000 | Порт frontend |
| `DATABASE_URL` | sqlite:////data/tasks.db | Путь к БД |
| `COMPOSE_PROJECT_NAME` | recording_life | Префикс контейнеров |
| `LOG_LEVEL` | info | Уровень логирования |
| `TZ` | UTC | Timezone |

## 🔄 Смена окружения

### Вариант 1: Через --env-file (рекомендуется)

```bash
# Development
docker compose --env-file=.env.development up -d

# Production
docker compose --env-file=.env.production up -d

# Остановка
docker compose --env-file=.env.development down
```

### Вариант 2: Через симлинк

```bash
# Переключиться на development
ln -sf .env.development .env
docker compose up -d

# Переключиться на production
ln -sf .env.production .env
docker compose up -d

# Остановка
docker compose down
```

## 📊 Сравнение окружений

| Аспект | Development | Production |
|--------|-------------|------------|
| **Машина** | Desktop (192.168.1.13) | Server (192.168.1.72) |
| **Назначение** | Разработка, тестирование | Продакшн, стабильная версия |
| **Имена контейнеров** | `recording_life_dev-*` | `recording_life_prod-*` |
| **Логи** | DEBUG уровень | INFO уровень |
| **Hot reload** | ✅ Включен | ✅ Включен (для быстрых обновлений) |
| **Volume mounting** | ✅ Да (src/) | ✅ Да |
| **Автодеплой** | ❌ Ручной запуск | ✅ Через Forgejo CI/CD |

## 🎯 Типичные сценарии

### Разработка на Desktop

```bash
# 1. Запустите dev окружение
cd ~/WORKSPACE/recording_life_system
docker compose --env-file=.env.development up -d

# 2. Разрабатывайте код
# Изменения в frontend/src и backend/app применяются автоматически

# 3. Тестируйте
# - Desktop: http://192.168.1.13:3000
# - Phone: http://192.168.1.13:3000
# - Orange Pi: http://192.168.1.13:3000

# 4. Коммит и push в Forgejo
git add .
git commit -m "feat: новая функция"
git push origin main

# 5. На Server автоматически задеплоится через CI/CD
```

### Продакшн на Server

```bash
# Автоматический деплой через Forgejo Actions
# При push в main:
# 1. Forgejo запускает workflow
# 2. Runner на Server выполняет deploy
# 3. Контейнеры пересобираются с .env.production
# 4. Приложение доступно на http://192.168.1.72:3000

# Ручной деплой (если нужно):
cd ~/recording_life_system
docker compose --env-file=.env.production down
docker compose --env-file=.env.production up -d --build
```

## 🔍 Проверка окружения

```bash
# Проверить какое окружение используется
docker compose ps

# Development покажет:
# recording_life_dev-backend
# recording_life_dev-frontend

# Production покажет:
# recording_life_prod-backend
# recording_life_prod-frontend

# Проверить переменные окружения в контейнере
docker exec recording_life_prod-backend env | grep ENVIRONMENT
docker exec recording_life_prod-backend env | grep HOST_IP
```

## 🐛 Troubleshooting

### Конфликт портов

Если Desktop и Server запущены одновременно - конфликта НЕТ, так как они на разных машинах.

Но если запускаете оба окружения на одной машине:

```bash
# Измените порты в одном из .env
# Например, в .env.development:
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

### Проверка доступности

```bash
# На Desktop
curl http://192.168.1.13:8000/health   # Development
curl http://192.168.1.72:8000/health   # Production

# На Server
curl http://localhost:8000/health      # Production (локально)
curl http://192.168.1.13:8000/health   # Development на Desktop
```

### Переменные не подхватываются

```bash
# Убедитесь что используете правильный .env файл
docker compose --env-file=.env.production config

# Должно показать все подставленные переменные

# Пересоберите с очисткой кэша
docker compose --env-file=.env.production down
docker compose --env-file=.env.production build --no-cache
docker compose --env-file=.env.production up -d
```

## 🔒 Безопасность

### Что НЕ коммитить в Git

❌ `.env`
❌ `.env.development`
❌ `.env.production`
❌ `.env.local`
❌ Любые файлы с реальными credentials

### Что коммитить

✅ `.env.example` - шаблон без реальных данных
✅ `docker-compose.yml` - с переменными `${VAR}`
✅ `.gitignore` - с исключениями .env файлов

## 📚 Дополнительно

### Добавление нового окружения (Staging)

```bash
# 1. Создайте .env.staging
cp .env.example .env.staging

# 2. Настройте переменные
nano .env.staging

# 3. Используйте
docker compose --env-file=.env.staging up -d
```

### Миграция на статический IP и домен

Когда купите домен и получите статический IP:

```bash
# Обновите .env.production
HOST_IP=your.static.ip
DOMAIN=yourdomain.com
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws

# Добавьте Nginx/Caddy для SSL
# Обновите docker-compose.yml для reverse proxy
```

---

**Итого**: Теперь Desktop и Server имеют изолированные окружения с правильными IP адресами без хардкодов!
