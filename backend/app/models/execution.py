"""
SQLAlchemy модель для фиксации выполнения задач (Execution v1)
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database.session import Base


class Execution(Base):
    """
    Модель Execution v1 - фиксация факта выполнения

    Execution отвечает на вопросы:
    - Что реально произошло?
    - Когда?
    - Чем закончилось?
    - Какие данные я хочу сохранить по факту?

    Attributes:
        # Связь
        id: Уникальный идентификатор
        task_id: ID связанной задачи (обязательно)

        # Результат попытки
        status: completed | failed | skipped | partial

        # Временные параметры
        started_at: Время начала выполнения
        ended_at: Время окончания выполнения
        duration: Продолжительность в секундах

        # Фиксация данных
        payload: Произвольные данные (JSON)
        note: Текстовая заметка о выполнении

        # Метаданные
        recorded_by: manual | auto (способ записи)
        created_at: Время создания записи
    """
    __tablename__ = "executions"

    # Связь
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)

    # Результат попытки
    status = Column(String(50), nullable=False)  # completed | failed | skipped | partial

    # Временные параметры
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)  # в секундах

    # Фиксация данных (черный ящик)
    payload = Column(JSON, nullable=True)  # Произвольные данные
    note = Column(Text, nullable=True)

    # Метаданные
    recorded_by = Column(String(50), nullable=False, default="manual")  # manual | auto
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    task = relationship("Task", back_populates="executions")

    def __repr__(self):
        return f"<Execution(id={self.id}, task_id={self.task_id}, status='{self.status}', created_at='{self.created_at}')>"
