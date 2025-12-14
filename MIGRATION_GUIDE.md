# Руководство по миграции базы данных

## Обзор изменений

Модель `Task` была расширена для поддержки полноценного IT-трекера задач. Основные изменения:

### 1. Разделение идентификатора и приоритета

**До:**
- `id` - числовой идентификатор
- `priority` - числовое значение (1-999), которое также использовалось для отображения и сортировки

**После:**
- `id` - автоматический уникальный идентификатор
- `key` - человекочитаемый ключ (например, `TASK-123`), генерируется автоматически
- `priority` - текстовое значение (Critical / High / Medium / Low / Lowest)

### 2. Новые атрибуты модели Task

#### 1.1. Идентификация и описание
- `key` - Человекочитаемый ключ (TASK-123)
- `type` - Тип задачи (Task / Bug / Chore / Spike)

#### 1.2. Статус и жизненный цикл
- `status` - Backlog / To Do / In Progress / Done
- `resolution` - Fixed / Won't Do / Duplicate / Done
- `completed_at` - Дата завершения

#### 1.3. Ответственность и владение (объявлены, но пока не используются)
- `assignee` - Исполнитель
- `reporter` - Автор задачи
- `watchers` - Наблюдатели

#### 1.4. Приоритет и срочность
- `severity` - Влияние на систему
- `due_date` - Дедлайн
- `sla` - Ограничения по времени

#### 1.5. Планирование и оценка
- `estimate` - Оценка (time / story points)
- `original_estimate` - Исходная оценка
- `remaining_estimate` - Остаток
- `time_spent` - Фактически потрачено
- `start_date` - Когда можно начинать

#### 1.6. Связи и структура
- `project_id` - Проект
- `parent_id` - Родительская задача
- `subtasks` - Подзадачи (JSON)
- `dependencies` - Blocked by / Blocks (JSON)
- `links` - Связанные задачи (JSON)

#### 1.7. Классификация и группировка
- `labels` - Теги (JSON)
- `components` - Подсистема (JSON)
- `epic_id` - Epic
- `sprint_id` - Спринт
- `milestone` - Веха

#### 2. Контекст выполнения
- `location` - Дом / Работа / Любое
- `tools_required` - Необходимые инструменты (JSON)
- `environment` - Тишина / Фон
- `connectivity` - Online / Offline
- `execution_mode` - Solo / Async / Sync

#### 3. Рутинность и повторяемость
- `is_repeatable` - Повторяемая задача (boolean)
- `recurrence_rule` - Daily / Weekly / Cron
- `routine_type` - Routine / Ad-hoc
- `maintenance_level` - Core / Optional
- `skip_penalty` - Что будет, если пропустить

## Совместимость с VoskDemoMicroCheck

### Обратная совместимость API

Все новые поля являются **опциональными**, поэтому старые API запросы продолжат работать:

**Старый запрос (продолжит работать):**
```json
POST /api/tasks/
{
  "title": "Задача",
  "description": "Описание",
  "priority": 1
}
```

**Новый запрос:**
```json
POST /api/tasks/
{
  "title": "Задача",
  "description": "Описание",
  "priority": "High",
  "status": "To Do",
  "type": "Task",
  "due_date": "2025-01-15",
  "labels": ["frontend", "важное"]
}
```

### Что нужно обновить в VoskDemoMicroCheck

Если проект VoskDemoMicroCheck использует следующие endpoints, обновления не требуются:

- ✅ `GET /api/tasks/` - работает как раньше
- ✅ `GET /api/tasks/{id}/` - работает как раньше
- ✅ `POST /api/tasks/` - принимает старые и новые форматы
- ✅ `PUT /api/tasks/{id}/` - принимает старые и новые форматы
- ✅ `DELETE /api/tasks/{id}/` - работает как раньше

**Единственное изменение:** поле `priority` теперь возвращает строку вместо числа.

#### Если VoskDemoMicroCheck ожидает числовой priority:

Добавьте mapping в коде VoskDemoMicroCheck:

```python
PRIORITY_MAPPING = {
    "Critical": 1,
    "High": 2,
    "Medium": 3,
    "Low": 4,
    "Lowest": 5
}

# При получении задачи
priority_number = PRIORITY_MAPPING.get(task["priority"], 3)
```

## Инструкции по миграции

### Вариант 1: Пересоздать базу данных (рекомендуется для разработки)

```bash
# 1. Остановить приложение
docker-compose down

# 2. Удалить старую базу данных
docker volume rm recording_life_system_tasks_data
# или
rm -rf /data/tasks.db

# 3. Запустить приложение заново
docker-compose up -d

# База данных будет создана автоматически с новой схемой
```

### Вариант 2: Мигрировать существующую базу данных

```bash
# 1. Создать резервную копию базы данных
cp /data/tasks.db /data/tasks.db.backup

# 2. Запустить скрипт миграции
cd backend
python migrate_database.py

# 3. Перезапустить приложение
docker-compose restart
```

## Проверка после миграции

1. Проверьте, что приложение запускается без ошибок
2. Создайте новую задачу и убедитесь, что:
   - Генерируется ключ в формате `TASK-{id}`
   - Приоритет отображается как текст (Critical, High, Medium, Low, Lowest)
   - Сортировка работает корректно
3. Проверьте, что старые задачи отображаются корректно

## Откат изменений

Если что-то пошло не так:

```bash
# 1. Остановить приложение
docker-compose down

# 2. Восстановить базу данных из резервной копии
cp /data/tasks.db.backup /data/tasks.db

# 3. Откатить код на предыдущий коммит
git checkout <previous_commit>

# 4. Запустить приложение
docker-compose up -d
```

## Дополнительная информация

- Все JSON поля (labels, tools_required, subtasks и т.д.) хранятся как JSON в SQLite
- Поля типа Date хранятся в формате ISO 8601 (YYYY-MM-DD)
- Сортировка задач теперь основана на приоритете (Critical > High > Medium > Low > Lowest), а не на числовом значении
