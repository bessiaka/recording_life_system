# 🎤 Todo Voice App

Веб-приложение для управления задачами с **голосовым управлением** и **реал-тайм синхронизацией** между устройствами.

---

## ✨ Возможности

- ✅ **Голосовое управление** - добавляй, удаляй и просматривай задачи голосом
- ✅ **Реал-тайм синхронизация** - изменения мгновенно отображаются на всех устройствах
- ✅ **Веб-интерфейс** - удобное управление через браузер
- ✅ **REST API** - программный доступ к задачам
- ✅ **WebSocket** - мгновенные обновления без перезагрузки страницы
- ✅ **Docker** - простой деплой в контейнерах

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                  КЛИЕНТЫ (браузеры)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ React UI │  │ React UI │  │ React UI │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                     │
│       └─────────────┴─────────────┘                     │
│            ↓ WebSocket + REST API                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │         BACKEND (FastAPI)                       │   │
│  │  • REST API для CRUD операций                  │   │
│  │  • WebSocket для реал-тайм обновлений          │   │
│  │  • SQLite база данных                          │   │
│  └─────────────────────────────────────────────────┘   │
│                     ↑                                   │
│              REST API вызовы                            │
│                     │                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │      VOICE COMMAND SYSTEM                       │   │
│  │  "команда добавить задачу купить молоко"       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Быстрый старт

### Требования

- Docker & Docker Compose
- 3 GB свободного места на диске

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd todo-voice-app
```

### 2. Создать директорию для данных

```bash
mkdir -p data
```

### 3. Запустить приложение

```bash
docker-compose up -d
```

### 4. Открыть в браузере

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📱 Использование

### Веб-интерфейс

1. Открой http://localhost:3000 в браузере
2. Нажми **"➕ Добавить задачу"**
3. Заполни форму и нажми **"Создать"**
4. Задача появится в списке на всех открытых устройствах

### REST API

```bash
# Получить все задачи
curl http://localhost:8000/api/tasks

# Создать задачу
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Купить молоко", "priority": 1}'

# Обновить задачу
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Купить молоко и хлеб"}'

# Удалить задачу
curl -X DELETE http://localhost:8000/api/tasks/1
```

### Голосовое управление

См. [voice-integration/INTEGRATION.md](voice-integration/INTEGRATION.md)

---

## 🛠️ Разработка

### Структура проекта

```
todo-voice-app/
├── backend/                 # FastAPI приложение
│   ├── app/
│   │   ├── api/            # REST endpoints
│   │   ├── models/         # SQLAlchemy модели
│   │   ├── schemas/        # Pydantic схемы
│   │   ├── websocket/      # WebSocket manager
│   │   └── main.py         # Точка входа
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # React приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand store
│   │   └── api/           # API client
│   ├── Dockerfile
│   └── package.json
│
├── voice-integration/     # Интеграция с voice-app
│   ├── commands/          # Голосовые команды
│   └── config/            # Конфигурация
│
├── data/                  # SQLite база (не в Git)
├── docker-compose.yml     # Оркестрация сервисов
└── README.md
```

### Запуск в режиме разработки

```bash
# Backend (с hot reload)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (с hot reload)
cd frontend
npm install
npm run dev
```

### Логи

```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend
```

### Остановить приложение

```bash
docker-compose down
```

### Удалить данные

```bash
docker-compose down -v
rm -rf data/
```

---

## 🎤 Интеграция с Voice App

Подробная инструкция: [voice-integration/INTEGRATION.md](voice-integration/INTEGRATION.md)

**Кратко:**

1. Скопируй `voice-integration/commands/todo_commands.py` в свой voice-app
2. Добавь конфигурацию из `voice-integration/config/todo_commands.yaml`
3. Установи `requests` в voice-app
4. Перезапусти voice-app

**Примеры команд:**

```
👤 "команда добавить задачу купить молоко"
🤖 ✅ Задача добавлена: купить молоко

👤 "команда список"
🤖 📋 Задач: 3. 1. Купить молоко, 2. Позвонить маме, 3. Сделать отчет

👤 "команда удалить первую"
🤖 ✅ Задача удалена: купить молоко
```

---

## 🌐 Доступ из локальной сети

### 1. Узнай IP адрес компьютера

```bash
# Linux/Mac
ifconfig | grep inet

# Результат, например: 192.168.1.100
```

### 2. Обнови конфигурацию

В `frontend/.env`:
```env
VITE_API_URL=http://192.168.1.100:8000
VITE_WS_URL=ws://192.168.1.100:8000/ws
```

### 3. Перезапусти приложение

```bash
docker-compose down
docker-compose up -d
```

### 4. Открой на других устройствах

На любом устройстве в той же WiFi сети:
```
http://192.168.1.100:3000
```

---

## 📊 API Endpoints

### Tasks

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/tasks` | Получить все задачи |
| GET | `/api/tasks/{id}` | Получить задачу по ID |
| POST | `/api/tasks` | Создать задачу |
| PUT | `/api/tasks/{id}` | Обновить задачу |
| DELETE | `/api/tasks/{id}` | Удалить задачу |

### WebSocket

| Endpoint | Описание |
|----------|----------|
| `/ws` | WebSocket для реал-тайм обновлений |

**Сообщения:**
```json
{
  "type": "task_created",
  "task": {...}
}

{
  "type": "task_updated",
  "task": {...}
}

{
  "type": "task_deleted",
  "task_id": 1
}
```

---

## 🔧 Конфигурация

### Backend переменные окружения

- `DATABASE_URL` - путь к SQLite БД (default: `sqlite:////data/tasks.db`)
- `PYTHONUNBUFFERED` - отключить буферизацию Python (default: `1`)

### Frontend переменные окружения

- `VITE_API_URL` - URL backend API (default: `http://localhost:8000`)
- `VITE_WS_URL` - URL WebSocket (default: `ws://localhost:8000/ws`)

---

## 🐛 Troubleshooting

### Backend не запускается

```bash
# Проверь логи
docker-compose logs backend

# Проверь порт
lsof -i :8000

# Пересобери контейнер
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Frontend не подключается к backend

1. Проверь что backend запущен: `curl http://localhost:8000/health`
2. Проверь CORS в `backend/app/main.py`
3. Проверь переменные окружения в `frontend/.env`

### WebSocket не работает

1. Проверь подключение: открой DevTools → Network → WS
2. Проверь что backend запущен
3. Проверь `VITE_WS_URL` в `frontend/.env`

### База данных повреждена

```bash
# Удали БД и перезапусти
rm data/tasks.db
docker-compose restart backend
```

---

## 📄 Лицензия

MIT

---

## 🤝 Contribution

Pull requests are welcome!

---

## 📧 Контакты

Если возникли вопросы - создай Issue в репозитории.
