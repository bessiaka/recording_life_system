# 📚 API Documentation

Подробная документация REST API и WebSocket endpoints для Todo Voice App.

---

## 🌐 Базовая информация

- **Base URL**: `http://localhost:8000`
- **WebSocket URL**: `ws://localhost:8000/ws`
- **API Version**: `1.0.0`
- **Content-Type**: `application/json`

---

## 📋 Содержание

1. [REST API Endpoints](#rest-api-endpoints)
   - [Служебные endpoints](#служебные-endpoints)
   - [Tasks API](#tasks-api)
2. [WebSocket API](#websocket-api)
3. [Схемы данных](#схемы-данных)
4. [Примеры использования](#примеры-использования)

---

## REST API Endpoints

### Служебные endpoints

#### `GET /`
Корневой endpoint с информацией о API.

**Пример запроса:**
```bash
curl http://localhost:8000/
```

**Ответ:**
```json
{
  "message": "Todo Voice API",
  "version": "1.0.0",
  "endpoints": {
    "tasks": "/api/tasks",
    "websocket": "/ws",
    "docs": "/docs"
  }
}
```

---

#### `GET /health`
Health check endpoint для мониторинга.

**Пример запроса:**
```bash
curl http://localhost:8000/health
```

**Ответ:**
```json
{
  "status": "healthy"
}
```

---

### Tasks API

#### `GET /api/tasks/`
Получить список всех задач, отсортированных по приоритету.

**Параметры:** нет

**Заголовки:** нет обязательных

**Пример запроса:**
```bash
curl http://localhost:8000/api/tasks/
```

**Ответ (200 OK):**
```json
[
  {
    "id": 1,
    "key": "TASK-1",
    "title": "Купить молоко",
    "description": "Купить молоко 3.2% в Пятёрочке",
    "type": "Task",
    "status": "To Do",
    "resolution": null,
    "priority": "High",
    "severity": null,
    "due_date": "2025-12-20",
    "sla": null,
    "estimate": "15m",
    "original_estimate": "15m",
    "remaining_estimate": "15m",
    "time_spent": null,
    "start_date": null,
    "project_id": null,
    "parent_id": null,
    "subtasks": null,
    "dependencies": null,
    "links": null,
    "labels": ["shopping", "urgent"],
    "components": null,
    "epic_id": null,
    "sprint_id": null,
    "milestone": null,
    "location": "Дом",
    "tools_required": null,
    "environment": null,
    "connectivity": "Offline",
    "execution_mode": "Solo",
    "is_repeatable": false,
    "recurrence_rule": null,
    "routine_type": null,
    "maintenance_level": null,
    "skip_penalty": null,
    "assignee": "Ivan",
    "reporter": "System",
    "watchers": null,
    "created_at": "2025-12-15T10:30:00",
    "updated_at": "2025-12-15T10:30:00",
    "completed_at": null
  },
  {
    "id": 2,
    "key": "TASK-2",
    "title": "Позвонить маме",
    "description": null,
    "type": "Task",
    "status": "Backlog",
    "resolution": null,
    "priority": "Medium",
    "severity": null,
    "due_date": null,
    "sla": null,
    "estimate": null,
    "original_estimate": null,
    "remaining_estimate": null,
    "time_spent": null,
    "start_date": null,
    "project_id": null,
    "parent_id": null,
    "subtasks": null,
    "dependencies": null,
    "links": null,
    "labels": null,
    "components": null,
    "epic_id": null,
    "sprint_id": null,
    "milestone": null,
    "location": null,
    "tools_required": null,
    "environment": null,
    "connectivity": null,
    "execution_mode": null,
    "is_repeatable": false,
    "recurrence_rule": null,
    "routine_type": null,
    "maintenance_level": null,
    "skip_penalty": null,
    "assignee": null,
    "reporter": null,
    "watchers": null,
    "created_at": "2025-12-15T11:00:00",
    "updated_at": "2025-12-15T11:00:00",
    "completed_at": null
  }
]
```

**Сортировка:**
Задачи сортируются по приоритету:
1. Critical
2. High
3. Medium
4. Low
5. Lowest

Внутри каждого приоритета - по дате создания (`created_at`).

---

#### `GET /api/tasks/{task_id}/`
Получить задачу по ID.

**Параметры:**
- `task_id` (path, integer, required) - ID задачи

**Пример запроса:**
```bash
curl http://localhost:8000/api/tasks/1/
```

**Ответ (200 OK):**
```json
{
  "id": 1,
  "key": "TASK-1",
  "title": "Купить молоко",
  "description": "Купить молоко 3.2% в Пятёрочке",
  "type": "Task",
  "status": "To Do",
  "resolution": null,
  "priority": "High",
  "severity": null,
  "due_date": "2025-12-20",
  "sla": null,
  "estimate": "15m",
  "original_estimate": "15m",
  "remaining_estimate": "15m",
  "time_spent": null,
  "start_date": null,
  "project_id": null,
  "parent_id": null,
  "subtasks": null,
  "dependencies": null,
  "links": null,
  "labels": ["shopping", "urgent"],
  "components": null,
  "epic_id": null,
  "sprint_id": null,
  "milestone": null,
  "location": "Дом",
  "tools_required": null,
  "environment": null,
  "connectivity": "Offline",
  "execution_mode": "Solo",
  "is_repeatable": false,
  "recurrence_rule": null,
  "routine_type": null,
  "maintenance_level": null,
  "skip_penalty": null,
  "assignee": "Ivan",
  "reporter": "System",
  "watchers": null,
  "created_at": "2025-12-15T10:30:00",
  "updated_at": "2025-12-15T10:30:00",
  "completed_at": null
}
```

**Ошибки:**
```json
// 404 Not Found
{
  "detail": "Задача с ID 999 не найдена"
}
```

---

#### `POST /api/tasks/`
Создать новую задачу.

**Заголовки (опционально):**
- `X-Session-ID` - идентификатор сессии клиента (используется для определения инициатора в WebSocket сообщениях)

**Тело запроса (JSON):**

Обязательные поля:
- `title` (string, 1-200 символов) - заголовок задачи

Опциональные поля (все имеют значения по умолчанию):
- `description` (string) - описание задачи
- `type` (string, default: "Task") - тип задачи
- `status` (string, default: "Backlog") - статус
- `priority` (string, default: "Medium") - приоритет
- `due_date` (date, format: YYYY-MM-DD) - дедлайн
- `estimate` (string) - оценка времени
- `labels` (array of strings) - теги
- `location` (string) - место выполнения
- `is_repeatable` (boolean, default: false) - повторяемая задача
- И многие другие (см. раздел [Схемы данных](#схемы-данных))

**Пример минимального запроса:**
```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: web-client-123" \
  -d '{
    "title": "Купить хлеб"
  }'
```

**Пример полного запроса:**
```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: web-client-123" \
  -d '{
    "title": "Реализовать функцию авторизации",
    "description": "Добавить JWT авторизацию в API",
    "type": "Task",
    "status": "To Do",
    "priority": "High",
    "severity": "Major",
    "due_date": "2025-12-25",
    "estimate": "4h",
    "original_estimate": "4h",
    "labels": ["backend", "security"],
    "components": ["auth", "api"],
    "location": "Работа",
    "tools_required": ["IDE", "Postman"],
    "environment": "Тишина",
    "connectivity": "Online",
    "execution_mode": "Solo",
    "assignee": "Ivan",
    "reporter": "Manager"
  }'
```

**Ответ (201 Created):**
```json
{
  "id": 3,
  "key": "TASK-3",
  "title": "Реализовать функцию авторизации",
  "description": "Добавить JWT авторизацию в API",
  "type": "Task",
  "status": "To Do",
  "resolution": null,
  "priority": "High",
  "severity": "Major",
  "due_date": "2025-12-25",
  "sla": null,
  "estimate": "4h",
  "original_estimate": "4h",
  "remaining_estimate": null,
  "time_spent": null,
  "start_date": null,
  "project_id": null,
  "parent_id": null,
  "subtasks": null,
  "dependencies": null,
  "links": null,
  "labels": ["backend", "security"],
  "components": ["auth", "api"],
  "epic_id": null,
  "sprint_id": null,
  "milestone": null,
  "location": "Работа",
  "tools_required": ["IDE", "Postman"],
  "environment": "Тишина",
  "connectivity": "Online",
  "execution_mode": "Solo",
  "is_repeatable": false,
  "recurrence_rule": null,
  "routine_type": null,
  "maintenance_level": null,
  "skip_penalty": null,
  "assignee": "Ivan",
  "reporter": "Manager",
  "watchers": null,
  "created_at": "2025-12-15T12:00:00.123456",
  "updated_at": "2025-12-15T12:00:00.123456",
  "completed_at": null
}
```

**Побочные эффекты:**
- Автоматически генерируется `key` в формате `TASK-{id}`
- Отправляется WebSocket сообщение всем подключенным клиентам (см. [WebSocket: task_created](#taskcreated))

---

#### `PUT /api/tasks/{task_id}/`
Обновить существующую задачу.

**Параметры:**
- `task_id` (path, integer, required) - ID задачи

**Заголовки (опционально):**
- `X-Session-ID` - идентификатор сессии клиента

**Тело запроса (JSON):**
Все поля опциональны. Передавайте только те поля, которые нужно изменить.

**Пример запроса - изменить статус:**
```bash
curl -X PUT http://localhost:8000/api/tasks/1/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: web-client-123" \
  -d '{
    "status": "In Progress"
  }'
```

**Пример запроса - отметить завершённой:**
```bash
curl -X PUT http://localhost:8000/api/tasks/1/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: web-client-123" \
  -d '{
    "status": "Done",
    "resolution": "Fixed",
    "completed_at": "2025-12-15T15:30:00"
  }'
```

**Пример запроса - обновить несколько полей:**
```bash
curl -X PUT http://localhost:8000/api/tasks/1/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: web-client-123" \
  -d '{
    "title": "Купить молоко и хлеб",
    "priority": "Critical",
    "due_date": "2025-12-16",
    "labels": ["shopping", "urgent", "groceries"]
  }'
```

**Ответ (200 OK):**
```json
{
  "id": 1,
  "key": "TASK-1",
  "title": "Купить молоко и хлеб",
  "description": "Купить молоко 3.2% в Пятёрочке",
  "type": "Task",
  "status": "To Do",
  "resolution": null,
  "priority": "Critical",
  "severity": null,
  "due_date": "2025-12-16",
  "sla": null,
  "estimate": "15m",
  "original_estimate": "15m",
  "remaining_estimate": "15m",
  "time_spent": null,
  "start_date": null,
  "project_id": null,
  "parent_id": null,
  "subtasks": null,
  "dependencies": null,
  "links": null,
  "labels": ["shopping", "urgent", "groceries"],
  "components": null,
  "epic_id": null,
  "sprint_id": null,
  "milestone": null,
  "location": "Дом",
  "tools_required": null,
  "environment": null,
  "connectivity": "Offline",
  "execution_mode": "Solo",
  "is_repeatable": false,
  "recurrence_rule": null,
  "routine_type": null,
  "maintenance_level": null,
  "skip_penalty": null,
  "assignee": "Ivan",
  "reporter": "System",
  "watchers": null,
  "created_at": "2025-12-15T10:30:00",
  "updated_at": "2025-12-15T15:45:00",
  "completed_at": null
}
```

**Ошибки:**
```json
// 404 Not Found
{
  "detail": "Задача с ID 999 не найдена"
}
```

**Побочные эффекты:**
- Обновляется поле `updated_at`
- Отправляется WebSocket сообщение всем подключенным клиентам (см. [WebSocket: task_updated](#taskupdated))

---

#### `DELETE /api/tasks/{task_id}/`
Удалить задачу.

**Параметры:**
- `task_id` (path, integer, required) - ID задачи

**Заголовки (опционально):**
- `X-Session-ID` - идентификатор сессии клиента

**Пример запроса:**
```bash
curl -X DELETE http://localhost:8000/api/tasks/1/ \
  -H "X-Session-ID: web-client-123"
```

**Ответ (204 No Content):**
Пустой ответ, только HTTP статус код.

**Ошибки:**
```json
// 404 Not Found
{
  "detail": "Задача с ID 999 не найдена"
}
```

**Побочные эффекты:**
- Задача удаляется из базы данных
- Отправляется WebSocket сообщение всем подключенным клиентам (см. [WebSocket: task_deleted](#taskdeleted))

---

## WebSocket API

### Подключение

**URL:** `ws://localhost:8000/ws`

**Пример подключения (JavaScript):**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('✅ WebSocket подключен');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('📩 Получено сообщение:', message);

  // Обработка разных типов сообщений
  switch (message.type) {
    case 'task_created':
      handleTaskCreated(message.task, message.session_id);
      break;
    case 'task_updated':
      handleTaskUpdated(message.task, message.session_id);
      break;
    case 'task_deleted':
      handleTaskDeleted(message.task_id, message.session_id);
      break;
  }
};

ws.onerror = (error) => {
  console.error('❌ WebSocket ошибка:', error);
};

ws.onclose = () => {
  console.log('🔌 WebSocket отключен');
};
```

**Пример подключения (Python):**
```python
import asyncio
import websockets
import json

async def listen():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        print("✅ WebSocket подключен")

        while True:
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📩 Получено: {data}")

            # Обработка сообщений
            if data['type'] == 'task_created':
                print(f"  Новая задача: {data['task']['title']}")
            elif data['type'] == 'task_updated':
                print(f"  Обновлена задача: {data['task']['title']}")
            elif data['type'] == 'task_deleted':
                print(f"  Удалена задача ID: {data['task_id']}")

asyncio.run(listen())
```

---

### Типы сообщений

#### `task_created`

Отправляется когда создаётся новая задача через `POST /api/tasks/`.

**Формат сообщения:**
```json
{
  "type": "task_created",
  "task": {
    "id": 5,
    "key": "TASK-5",
    "title": "Новая задача",
    "description": null,
    "type": "Task",
    "status": "Backlog",
    "priority": "Medium",
    "created_at": "2025-12-15T16:00:00.123456",
    "updated_at": "2025-12-15T16:00:00.123456",
    // ... все остальные поля задачи
  },
  "session_id": "web-client-123"
}
```

**Поля:**
- `type` (string) - тип сообщения, всегда `"task_created"`
- `task` (object) - полный объект созданной задачи (см. [TaskResponse](#taskresponse))
- `session_id` (string) - ID сессии клиента, который создал задачу

**Использование:**
Клиент должен добавить задачу в локальный список. Если `session_id` совпадает с ID текущего клиента, задача уже добавлена оптимистично, и можно просто обновить ID.

---

#### `task_updated`

Отправляется когда обновляется задача через `PUT /api/tasks/{task_id}/`.

**Формат сообщения:**
```json
{
  "type": "task_updated",
  "task": {
    "id": 3,
    "key": "TASK-3",
    "title": "Обновлённая задача",
    "status": "In Progress",
    "priority": "High",
    "updated_at": "2025-12-15T16:30:00.654321",
    // ... все остальные поля задачи
  },
  "session_id": "web-client-456"
}
```

**Поля:**
- `type` (string) - тип сообщения, всегда `"task_updated"`
- `task` (object) - полный объект обновлённой задачи (см. [TaskResponse](#taskresponse))
- `session_id` (string) - ID сессии клиента, который обновил задачу

**Использование:**
Клиент должен обновить задачу в локальном списке. Если `session_id` совпадает с ID текущего клиента, можно проигнорировать (чтобы не перезаписать оптимистичное обновление).

---

#### `task_deleted`

Отправляется когда удаляется задача через `DELETE /api/tasks/{task_id}/`.

**Формат сообщения:**
```json
{
  "type": "task_deleted",
  "task_id": 7,
  "session_id": "web-client-789"
}
```

**Поля:**
- `type` (string) - тип сообщения, всегда `"task_deleted"`
- `task_id` (integer) - ID удалённой задачи
- `session_id` (string) - ID сессии клиента, который удалил задачу

**Использование:**
Клиент должен удалить задачу из локального списка. Если `session_id` совпадает с ID текущего клиента, задача уже удалена оптимистично.

---

## Схемы данных

### TaskResponse

Полная схема ответа с задачей. Используется в ответах всех endpoints и WebSocket сообщениях.

```typescript
interface TaskResponse {
  // 1.1. Идентификация и описание
  id: number;                          // Уникальный ID (автогенерируется)
  key: string | null;                  // Человекочитаемый ключ "TASK-123" (автогенерируется)
  title: string;                       // Заголовок (1-200 символов, обязательно)
  description: string | null;          // Развёрнутое описание
  type: string | null;                 // Тип: Task / Bug / Chore / Spike (default: "Task")

  // 1.2. Статус и жизненный цикл
  status: string | null;               // Backlog / To Do / In Progress / Done (default: "Backlog")
  resolution: string | null;           // Fixed / Won't Do / Duplicate / Done
  created_at: string;                  // ISO 8601 datetime (автогенерируется)
  updated_at: string;                  // ISO 8601 datetime (автообновляется)
  completed_at: string | null;         // ISO 8601 datetime

  // 1.3. Ответственность и владение
  assignee: string | null;             // Исполнитель
  reporter: string | null;             // Автор задачи
  watchers: string[] | null;           // Наблюдатели

  // 1.4. Приоритет и срочность
  priority: string | null;             // Lowest / Low / Medium / High / Critical (default: "Medium")
  severity: string | null;             // Влияние на систему
  due_date: string | null;             // Дедлайн (ISO 8601 date: YYYY-MM-DD)
  sla: string | null;                  // SLA

  // 1.5. Планирование и оценка
  estimate: string | null;             // Оценка (например: "2h", "3 story points")
  original_estimate: string | null;    // Исходная оценка
  remaining_estimate: string | null;   // Остаток
  time_spent: string | null;           // Фактически потрачено
  start_date: string | null;           // Дата начала (ISO 8601 date)

  // 1.6. Связи и структура
  project_id: number | null;           // ID проекта
  parent_id: number | null;            // ID родительской задачи
  subtasks: number[] | null;           // Список ID подзадач
  dependencies: {                      // Зависимости
    blocked_by?: number[];             // Блокируется задачами
    blocks?: number[];                 // Блокирует задачи
  } | null;
  links: number[] | null;              // Связанные задачи

  // 1.7. Классификация и группировка
  labels: string[] | null;             // Теги
  components: string[] | null;         // Компоненты/подсистемы
  epic_id: number | null;              // ID эпика
  sprint_id: number | null;            // ID спринта
  milestone: string | null;            // Веха

  // 2. Контекст выполнения
  location: string | null;             // Дом / Работа / Любое
  tools_required: string[] | null;     // Необходимые инструменты
  environment: string | null;          // Тишина / Фон
  connectivity: string | null;         // Online / Offline
  execution_mode: string | null;       // Solo / Async / Sync

  // 3. Рутинность и повторяемость
  is_repeatable: boolean;              // Повторяемая задача (default: false)
  recurrence_rule: string | null;      // Daily / Weekly / Cron
  routine_type: string | null;         // Routine / Ad-hoc
  maintenance_level: string | null;    // Core / Optional
  skip_penalty: string | null;         // Штраф за пропуск
}
```

### TaskCreate

Схема для создания задачи. Только `title` обязателен, остальные поля опциональны.

```typescript
interface TaskCreate {
  // Обязательные поля
  title: string;                       // 1-200 символов

  // Опциональные поля (те же что в TaskResponse, кроме автогенерируемых)
  description?: string | null;
  type?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;            // YYYY-MM-DD
  estimate?: string | null;
  labels?: string[] | null;
  location?: string | null;
  is_repeatable?: boolean;
  // ... и все остальные поля из TaskResponse, кроме:
  // id, key, created_at, updated_at, completed_at
}
```

### TaskUpdate

Схема для обновления задачи. Все поля опциональны.

```typescript
interface TaskUpdate {
  // Все поля опциональны - передавайте только те, что нужно изменить
  title?: string;                      // 1-200 символов
  description?: string | null;
  type?: string | null;
  status?: string | null;
  resolution?: string | null;
  completed_at?: string | null;        // ISO 8601 datetime
  assignee?: string | null;
  reporter?: string | null;
  watchers?: string[] | null;
  priority?: string | null;
  severity?: string | null;
  due_date?: string | null;            // YYYY-MM-DD
  sla?: string | null;
  estimate?: string | null;
  original_estimate?: string | null;
  remaining_estimate?: string | null;
  time_spent?: string | null;
  start_date?: string | null;          // YYYY-MM-DD
  project_id?: number | null;
  parent_id?: number | null;
  subtasks?: number[] | null;
  dependencies?: {
    blocked_by?: number[];
    blocks?: number[];
  } | null;
  links?: number[] | null;
  labels?: string[] | null;
  components?: string[] | null;
  epic_id?: number | null;
  sprint_id?: number | null;
  milestone?: string | null;
  location?: string | null;
  tools_required?: string[] | null;
  environment?: string | null;
  connectivity?: string | null;
  execution_mode?: string | null;
  is_repeatable?: boolean;
  recurrence_rule?: string | null;
  routine_type?: string | null;
  maintenance_level?: string | null;
  skip_penalty?: string | null;
}
```

---

## Примеры использования

### Сценарий 1: Простое управление задачами

```bash
# 1. Создать задачу
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Купить продукты"}'

# Ответ: {"id": 1, "key": "TASK-1", "title": "Купить продукты", ...}

# 2. Получить все задачи
curl http://localhost:8000/api/tasks/

# 3. Обновить задачу - отметить в работе
curl -X PUT http://localhost:8000/api/tasks/1/ \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'

# 4. Обновить задачу - завершить
curl -X PUT http://localhost:8000/api/tasks/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Done",
    "resolution": "Fixed",
    "completed_at": "2025-12-15T18:00:00"
  }'

# 5. Удалить задачу
curl -X DELETE http://localhost:8000/api/tasks/1/
```

---

### Сценарий 2: Создание детальной задачи

```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: my-client" \
  -d '{
    "title": "Исправить баг с авторизацией",
    "description": "Пользователи не могут войти через Google OAuth",
    "type": "Bug",
    "status": "To Do",
    "priority": "Critical",
    "severity": "Blocker",
    "due_date": "2025-12-16",
    "estimate": "2h",
    "original_estimate": "2h",
    "labels": ["bug", "auth", "urgent"],
    "components": ["backend", "oauth"],
    "assignee": "Ivan",
    "reporter": "QA Team",
    "location": "Работа",
    "tools_required": ["IDE", "Browser DevTools"],
    "connectivity": "Online"
  }'
```

---

### Сценарий 3: Работа с зависимостями

```bash
# 1. Создать родительскую задачу
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Реализовать систему уведомлений",
    "type": "Task",
    "priority": "High",
    "estimate": "8h"
  }'
# Ответ: {"id": 10, ...}

# 2. Создать подзадачу 1
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Настроить Email SMTP",
    "parent_id": 10,
    "estimate": "2h"
  }'
# Ответ: {"id": 11, ...}

# 3. Создать подзадачу 2 (зависит от подзадачи 1)
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Реализовать шаблоны писем",
    "parent_id": 10,
    "dependencies": {"blocked_by": [11]},
    "estimate": "3h"
  }'
# Ответ: {"id": 12, ...}

# 4. Обновить родительскую задачу - добавить подзадачи
curl -X PUT http://localhost:8000/api/tasks/10/ \
  -H "Content-Type: application/json" \
  -d '{
    "subtasks": [11, 12]
  }'
```

---

### Сценарий 4: Real-time синхронизация

**Клиент 1 (Python):**
```python
import asyncio
import websockets
import requests
import json

async def client1():
    # Подключаемся к WebSocket
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        print("Client 1: WebSocket подключен")

        # Слушаем обновления
        async def listen():
            while True:
                msg = json.loads(await ws.recv())
                print(f"Client 1: Получено {msg['type']}")
                if msg['type'] == 'task_created':
                    print(f"  Создана: {msg['task']['title']}")

        await listen()

asyncio.run(client1())
```

**Клиент 2 (создаёт задачу):**
```bash
# Клиент 2 создаёт задачу
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: client-2" \
  -d '{"title": "Позвонить клиенту"}'
```

**Результат в Client 1:**
```
Client 1: Получено task_created
  Создана: Позвонить клиенту
```

---

### Сценарий 5: Повторяющиеся задачи

```bash
# Создать ежедневную рутинную задачу
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Проверить почту",
    "type": "Chore",
    "priority": "Low",
    "is_repeatable": true,
    "recurrence_rule": "Daily",
    "routine_type": "Routine",
    "maintenance_level": "Core",
    "skip_penalty": "Пропущенные письма",
    "estimate": "15m",
    "location": "Любое",
    "connectivity": "Online"
  }'
```

---

## 🔒 Безопасность и ограничения

### CORS
API настроен с `allow_origins=["*"]` для разработки. В продакшене укажите конкретные домены.

### Rate Limiting
В текущей версии отсутствует. Рекомендуется добавить для продакшена.

### Аутентификация
В текущей версии отсутствует. Все endpoints доступны публично.

### Валидация
- `title`: 1-200 символов (обязательно)
- `due_date`, `start_date`: формат ISO 8601 date (YYYY-MM-DD)
- `created_at`, `updated_at`, `completed_at`: формат ISO 8601 datetime
- JSON поля (`labels`, `subtasks`, и т.д.): валидный JSON массив или объект

---

## 📊 Коды ответов

| Код | Описание |
|-----|----------|
| 200 | OK - успешный GET/PUT запрос |
| 201 | Created - задача создана (POST) |
| 204 | No Content - задача удалена (DELETE) |
| 404 | Not Found - задача не найдена |
| 422 | Unprocessable Entity - ошибка валидации |
| 500 | Internal Server Error - ошибка сервера |

---

## 🔧 Дополнительная информация

### Интерактивная документация

FastAPI автоматически генерирует интерактивную документацию:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Используйте их для тестирования API прямо в браузере.

### Логирование

Сервер логирует все операции:

```bash
# Просмотр логов
docker-compose logs -f backend

# Примеры логов:
# 2025-12-15 10:30:00 | INFO | ✅ Задача создана: ID=1, key='TASK-1', title='Купить молоко'
# 2025-12-15 10:35:00 | INFO | ✏️ Задача обновлена: ID=1
# 2025-12-15 10:40:00 | INFO | 🗑️  Задача удалена: ID=1
```

### База данных

- **Тип**: SQLite
- **Путь**: `/data/tasks.db` (в контейнере) или `./data/tasks.db` (на хосте)
- **Миграции**: Автоматическое создание таблиц при запуске (SQLAlchemy ORM)

---

## 📞 Поддержка

Если возникли вопросы или найдены баги - создайте Issue в репозитории проекта.
