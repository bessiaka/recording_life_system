"""
Pydantic схемы для валидации данных Task v1
"""
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, Dict, Any, List


# Вложенные схемы для context и recurrence
class TaskContext(BaseModel):
    """Контекст выполнения задачи"""
    location: Optional[str] = Field(None, description="Место выполнения: Home | Office | Anywhere")
    tools_required: Optional[List[str]] = Field(None, description="Необходимые инструменты")
    connectivity: Optional[str] = Field(None, description="Требование к сети: Online | Offline")


class TaskRecurrence(BaseModel):
    """Информация о повторяемости задачи"""
    is_repeatable: bool = Field(default=False, description="Повторяемая ли задача")
    routine_type: Optional[str] = Field(None, description="Тип рутины: Routine | Ad-hoc")
    recurrence_rule: Optional[str] = Field(None, description="Правило повторения (Daily, Weekly, Cron)")


class TaskBase(BaseModel):
    """
    Базовая схема Task v1 - декларация намерения (Intent)

    Task отвечает на вопросы:
    - Что это за ожидание?
    - Насколько оно важно?
    - Повторяется ли оно?
    - В каком контексте его можно выполнять?
    """
    # Идентификация и описание
    title: str = Field(..., min_length=1, max_length=200, description="Заголовок задачи")
    description: Optional[str] = Field(None, description="Описание задачи")
    type: str = Field(default="Task", description="Тип: Task | Bug | Chore")

    # Управление жизненным циклом
    status: str = Field(default="Backlog", description="Статус: Backlog | Active | Done | Archived")
    priority: str = Field(default="Medium", description="Приоритет: Low | Medium | High")

    # Планирование (минимум)
    due_date: Optional[date] = Field(None, description="Дедлайн (опционально)")

    # Контекст выполнения
    context: Optional[TaskContext] = Field(None, description="Контекст выполнения")

    # Рутинность и повторяемость
    recurrence: Optional[TaskRecurrence] = Field(None, description="Информация о повторяемости")


class TaskCreate(TaskBase):
    """Схема для создания задачи Task v1"""
    pass


class TaskUpdate(BaseModel):
    """Схема для обновления задачи Task v1 (все поля опциональны)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    context: Optional[TaskContext] = None
    recurrence: Optional[TaskRecurrence] = None


class TaskResponse(TaskBase):
    """Схема для ответа с задачей Task v1"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Для работы с ORM моделями
