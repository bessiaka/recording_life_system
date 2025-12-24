"""
Pydantic схемы для валидации данных Execution v1
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any


class ExecutionBase(BaseModel):
    """Базовая схема Execution"""
    # Результат попытки
    status: str = Field(..., description="Статус выполнения: completed | failed | skipped | partial")

    # Временные параметры
    started_at: Optional[datetime] = Field(None, description="Время начала выполнения")
    ended_at: Optional[datetime] = Field(None, description="Время окончания выполнения")
    duration: Optional[float] = Field(None, description="Продолжительность в секундах")

    # Фиксация данных
    payload: Optional[Dict[str, Any]] = Field(None, description="Произвольные данные (черный ящик)")
    note: Optional[str] = Field(None, description="Текстовая заметка о выполнении")

    # Метаданные
    recorded_by: Optional[str] = Field(default="manual", description="Способ записи: manual | auto")


class ExecutionCreate(ExecutionBase):
    """Схема для создания Execution"""
    task_id: int = Field(..., description="ID связанной задачи")


class ExecutionUpdate(BaseModel):
    """Схема для обновления Execution (все поля опциональны)"""
    status: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration: Optional[float] = None
    payload: Optional[Dict[str, Any]] = None
    note: Optional[str] = None
    recorded_by: Optional[str] = None


class ExecutionResponse(ExecutionBase):
    """Схема для ответа с Execution"""
    id: int
    task_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Для работы с ORM моделями
