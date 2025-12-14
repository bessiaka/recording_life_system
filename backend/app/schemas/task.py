"""
Pydantic схемы для валидации данных задач
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TaskBase(BaseModel):
    """Базовая схема задачи"""
    title: str = Field(..., min_length=1, max_length=200, description="Заголовок задачи")
    description: Optional[str] = Field(None, description="Описание задачи")
    priority: int = Field(default=999, ge=1, description="Приоритет (1 = высший)")


class TaskCreate(TaskBase):
    """Схема для создания задачи"""
    pass


class TaskUpdate(BaseModel):
    """Схема для обновления задачи (все поля опциональны)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1)


class TaskResponse(TaskBase):
    """Схема для ответа с задачей"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Для работы с ORM моделями
