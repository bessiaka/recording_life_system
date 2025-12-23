"""
Pydantic схемы для валидации данных задач
"""
from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Optional, List, Dict, Any


class TaskBase(BaseModel):
    """Базовая схема задачи"""
    # 1.1. Идентификация и описание
    title: str = Field(..., min_length=1, max_length=200, description="Заголовок задачи")
    description: Optional[str] = Field(None, description="Описание задачи")
    type: Optional[str] = Field(default="Task", description="Тип задачи")

    # 1.2. Статус и жизненный цикл
    status: Optional[str] = Field(default="Backlog", description="Статус задачи")
    resolution: Optional[str] = Field(None, description="Результат выполнения")

    # 1.4. Приоритет и срочность
    priority: Optional[str] = Field(default="Medium", description="Приоритет")
    severity: Optional[str] = Field(None, description="Серьезность")
    due_date: Optional[date] = Field(None, description="Дедлайн")
    sla: Optional[str] = Field(None, description="SLA")

    # 1.5. Планирование и оценка
    estimate: Optional[str] = Field(None, description="Оценка времени")
    original_estimate: Optional[str] = Field(None, description="Исходная оценка")
    remaining_estimate: Optional[str] = Field(None, description="Оставшееся время")
    time_spent: Optional[str] = Field(None, description="Потраченное время")
    start_date: Optional[date] = Field(None, description="Дата начала")
    scheduled_time: Optional[time] = Field(None, description="Время начала в течение дня")

    # 1.6. Связи и структура
    project_id: Optional[int] = Field(None, description="ID проекта")
    parent_id: Optional[int] = Field(None, description="ID родительской задачи")
    subtasks: Optional[List[int]] = Field(None, description="Список ID подзадач")
    dependencies: Optional[Dict[str, List[int]]] = Field(None, description="Зависимости")
    links: Optional[List[int]] = Field(None, description="Связанные задачи")

    # 1.7. Классификация и группировка
    labels: Optional[List[str]] = Field(None, description="Теги")
    components: Optional[List[str]] = Field(None, description="Компоненты")
    epic_id: Optional[int] = Field(None, description="ID эпика")
    sprint_id: Optional[int] = Field(None, description="ID спринта")
    milestone: Optional[str] = Field(None, description="Веха")

    # 2. Контекст выполнения
    location: Optional[str] = Field(None, description="Место выполнения")
    tools_required: Optional[List[str]] = Field(None, description="Необходимые инструменты")
    environment: Optional[str] = Field(None, description="Окружение")
    connectivity: Optional[str] = Field(None, description="Требование к сети")
    execution_mode: Optional[str] = Field(None, description="Режим выполнения")

    # 3. Рутинность и повторяемость
    is_repeatable: Optional[bool] = Field(default=False, description="Повторяемая задача")
    recurrence_rule: Optional[str] = Field(None, description="Правило повторения")
    recurrence_interval_hours: Optional[int] = Field(None, description="Интервал повторения в часах")
    recurrence_count: Optional[int] = Field(None, description="Количество повторений")
    routine_type: Optional[str] = Field(None, description="Тип рутины")
    maintenance_level: Optional[str] = Field(None, description="Уровень важности")
    skip_penalty: Optional[str] = Field(None, description="Штраф за пропуск")


class TaskCreate(TaskBase):
    """Схема для создания задачи"""
    # Все поля наследуются из TaskBase
    # key будет генерироваться автоматически на стороне сервера
    pass


class TaskUpdate(BaseModel):
    """Схема для обновления задачи (все поля опциональны)"""
    # 1.1. Идентификация и описание
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    type: Optional[str] = None

    # 1.2. Статус и жизненный цикл
    status: Optional[str] = None
    resolution: Optional[str] = None
    completed_at: Optional[datetime] = None

    # 1.3. Ответственность и владение
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    watchers: Optional[List[str]] = None

    # 1.4. Приоритет и срочность
    priority: Optional[str] = None
    severity: Optional[str] = None
    due_date: Optional[date] = None
    sla: Optional[str] = None

    # 1.5. Планирование и оценка
    estimate: Optional[str] = None
    original_estimate: Optional[str] = None
    remaining_estimate: Optional[str] = None
    time_spent: Optional[str] = None
    start_date: Optional[date] = None
    scheduled_time: Optional[time] = None

    # 1.6. Связи и структура
    project_id: Optional[int] = None
    parent_id: Optional[int] = None
    subtasks: Optional[List[int]] = None
    dependencies: Optional[Dict[str, List[int]]] = None
    links: Optional[List[int]] = None

    # 1.7. Классификация и группировка
    labels: Optional[List[str]] = None
    components: Optional[List[str]] = None
    epic_id: Optional[int] = None
    sprint_id: Optional[int] = None
    milestone: Optional[str] = None

    # 2. Контекст выполнения
    location: Optional[str] = None
    tools_required: Optional[List[str]] = None
    environment: Optional[str] = None
    connectivity: Optional[str] = None
    execution_mode: Optional[str] = None

    # 3. Рутинность и повторяемость
    is_repeatable: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    recurrence_interval_hours: Optional[int] = None
    recurrence_count: Optional[int] = None
    routine_type: Optional[str] = None
    maintenance_level: Optional[str] = None
    skip_penalty: Optional[str] = None


class TaskResponse(TaskBase):
    """Схема для ответа с задачей"""
    id: int
    key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    # 1.3. Ответственность и владение
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    watchers: Optional[List[str]] = None

    class Config:
        from_attributes = True  # Для работы с ORM моделями
