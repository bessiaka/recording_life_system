# Миграция к архитектуре v1: Task (Intent) + Execution (Fact)

## Концепция

Система была переработана с task-tracker на **систему фиксации намерений и фактов**:

- **Task v1** = декларация ожидания (intent) - "Что я планирую?"
- **Execution v1** = запись произошедшего события (fact) - "Что реально произошло?"

### Ключевая рамка v1

```
Task v1 = декларация ожидания (intent)
Execution v1 = запись произошедшего события (fact)
```

Никаких других сущностей в v1 не требуется.

### Архитектурная связка

```
┌──────────┐        1 ──▶ N        ┌────────────┐
│  Task    │──────────────────────│  Execution │
│ (Intent) │◀──────── context ────│   (Fact)   │
└──────────┘                       └────────────┘
```

- Одна Task → много Execution
- Execution никогда не существует без Task
- Task может существовать без Execution

## Изменения в схеме данных

### Task v1 (упрощенная модель)

#### Убрано:
- `key` (TASK-123) - больше не нужен
- Все Jira-style поля (assignee, reporter, watchers, epic_id, sprint_id и т.д.)
- Сложные planning поля (estimate, time_spent, original_estimate и т.д.)
- dependencies, links, subtasks

#### Оставлено и обновлено:

**Идентификация и описание**
```python
id: int
title: str
description: str (optional)
type: Task | Bug | Chore
```

**Управление жизненным циклом**
```python
status: Backlog | Active | Done | Archived
priority: Low | Medium | High
created_at: datetime
updated_at: datetime
```

**Планирование (минимум)**
```python
due_date: date (optional)
```

**Контекст выполнения (JSON структура)**
```python
context: {
    location: Home | Office | Anywhere
    tools_required: [...]
    connectivity: Online | Offline
}
```

**Рутинность и повторяемость (JSON структура)**
```python
recurrence: {
    is_repeatable: bool
    routine_type: Routine | Ad-hoc
    recurrence_rule: string  # Daily, Weekly, Cron
}
```

⚠️ **ВАЖНО**: `status = Done` означает что ожидание больше не актуально, а НЕ что задача была выполнена!

### Execution v1 (новая сущность)

**Связь**
```python
id: int
task_id: int (FK → tasks.id, CASCADE DELETE)
```

**Результат попытки**
```python
status: completed | failed | skipped | partial
```

**Временные параметры**
```python
started_at: datetime (optional)
ended_at: datetime (optional)
duration: float (seconds, optional)
```

**Фиксация данных (черный ящик)**
```python
payload: JSON (optional) - любые данные
note: text (optional)
```

**Метаданные**
```python
recorded_by: manual | auto
created_at: datetime
```

## API Endpoints

### Task v1

- `GET /api/tasks/` - Получить все задачи
- `GET /api/tasks/{id}/` - Получить задачу
- `POST /api/tasks/` - Создать задачу
- `PUT /api/tasks/{id}/` - Обновить задачу
- `DELETE /api/tasks/{id}/` - Удалить задачу

### Execution v1

- `POST /api/executions/` - Создать execution (фиксация факта)
- `GET /api/executions/task/{task_id}/` - Получить все executions для задачи
- `GET /api/executions/` - Получить все executions

## Инструкции по миграции

### 1. Остановить контейнеры

```bash
docker compose down
```

### 2. Запустить миграцию БД

```bash
docker compose run --rm backend python migrate_db.py
```

Скрипт миграции:
1. Создаст backup текущей БД в `/data/backups/tasks_backup_YYYYMMDD_HHMMSS.db`
2. Удалит старую БД
3. Создаст новую БД с таблицами `tasks` и `executions`

### 3. Запустить систему

```bash
docker compose up -d
```

### 4. Проверить работу

```bash
# Проверить логи backend
docker compose logs backend

# Проверить API
curl http://localhost:8000/
```

Ожидаемый ответ:
```json
{
  "message": "Recording Life System API v1",
  "version": "1.0.0",
  "description": "Intent (Task) + Fact (Execution) tracking system",
  "endpoints": {
    "tasks": "/api/tasks",
    "executions": "/api/executions",
    "websocket": "/ws",
    "docs": "/docs"
  }
}
```

## Тестирование API

### Создать Task

```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестовая задача v1",
    "description": "Проверка новой архитектуры",
    "type": "Task",
    "priority": "Medium",
    "status": "Active",
    "context": {
      "location": "Home",
      "tools_required": ["laptop"],
      "connectivity": "Online"
    }
  }'
```

### Создать Execution для Task

```bash
curl -X POST http://localhost:8000/api/executions/ \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": 1,
    "status": "completed",
    "started_at": "2025-12-24T10:00:00",
    "ended_at": "2025-12-24T10:30:00",
    "duration": 1800,
    "note": "Выполнено успешно",
    "recorded_by": "manual"
  }'
```

### Получить все Executions для Task

```bash
curl http://localhost:8000/api/executions/task/1/
```

## Жёсткие инварианты v1

Архитектурные правила, которые **нельзя нарушать**:

### 1. Task ≠ Execution
- ❌ Task не хранит результаты
- ❌ Execution не планируется
- ❌ Execution не изменяет Task напрямую

### 2. Связь 1 → N обязательна
```
Task.id → Execution.task_id
```
- Любая аналитика возможна только через Execution
- Task — это фильтр и группировка

### 3. Payload — «чёрный ящик»
- Task ничего не знает о структуре payload
- Execution ничего не знает о типе задачи
- Связь происходит на уровне пользователя / UI

## Структура проекта

### Backend

```
backend/app/
├── models/
│   ├── task.py         # Task v1 model
│   └── execution.py    # Execution v1 model (NEW)
├── schemas/
│   ├── task.py         # Task v1 schemas (UPDATED)
│   └── execution.py    # Execution v1 schemas (NEW)
├── api/
│   ├── tasks.py        # Task CRUD endpoints (UPDATED)
│   └── executions.py   # Execution endpoints (NEW)
└── main.py             # FastAPI app (UPDATED)

backend/migrate_db.py   # Migration script (NEW)
```

### Frontend

```
frontend/src/
├── types/
│   └── task.ts         # Task v1 + Execution v1 types (UPDATED)
├── api/
│   └── tasks.ts        # API client for Task + Execution (UPDATED)
├── store/
│   └── taskStore.ts    # Zustand store (UPDATED)
└── hooks/
    └── useWebSocket.ts # WebSocket hook (UPDATED)
```

## WebSocket события

Добавлено новое событие:

```typescript
{
  type: 'execution_created',
  execution: ExecutionResponse,
  session_id: string
}
```

Существующие события обновлены под Task v1.

## Восстановление из backup

Если миграция прошла неудачно:

```bash
# Остановить контейнеры
docker compose down

# Восстановить backup
docker compose run --rm backend bash -c "cp /data/backups/tasks_backup_YYYYMMDD_HHMMSS.db /data/tasks.db"

# Запустить с старой БД
docker compose up -d
```

## Заключение

Новая архитектура v1 полностью готова к использованию:

✅ Backend:
- Task v1 model
- Execution v1 model
- CRUD API для обеих сущностей
- WebSocket поддержка

✅ Frontend:
- TypeScript типы
- API client
- Zustand store
- WebSocket интеграция

✅ Документация и миграция

Система теперь является не task tracker, а **минимальной моделью жизни** - фиксацией намерений и их реализации.
