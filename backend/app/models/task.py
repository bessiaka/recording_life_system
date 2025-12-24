"""
SQLAlchemy модель для задач (Task v1)
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database.session import Base


class Task(Base):
    """
    Модель Task v1 - декларация намерения (Intent)

    Task отвечает на вопросы:
    - Что это за ожидание?
    - Насколько оно важно?
    - Повторяется ли оно?
    - В каком контексте его можно выполнять?

    ВАЖНО: status = Done означает что ожидание больше не актуально,
           а НЕ что задача была выполнена!

    Attributes:
        # Идентификация и описание
        id: Уникальный идентификатор
        title: Краткое название задачи
        description: Развёрнутое описание
        type: Task | Bug | Chore

        # Управление жизненным циклом
        status: Backlog | Active | Done | Archived
        priority: Low | Medium | High
        created_at: Дата создания
        updated_at: Последнее обновление

        # Планирование (минимум)
        due_date: Дедлайн (опционально)

        # Контекст выполнения
        context.location: Home | Office | Anywhere
        context.tools_required: Список необходимых инструментов
        context.connectivity: Online | Offline

        # Рутинность и повторяемость
        recurrence.is_repeatable: true | false
        recurrence.routine_type: Routine | Ad-hoc
        recurrence.recurrence_rule: Правило повторения
    """
    __tablename__ = "tasks"

    # Идентификация и описание
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False, default="Task")  # Task | Bug | Chore

    # Управление жизненным циклом
    status = Column(String(50), nullable=False, default="Backlog")  # Backlog | Active | Done | Archived
    priority = Column(String(50), nullable=False, default="Medium")  # Low | Medium | High
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Планирование (минимум)
    due_date = Column(Date, nullable=True)

    # Контекст выполнения (JSON структура)
    context = Column(JSON, nullable=True)  # {"location": "Home", "tools_required": [...], "connectivity": "Online"}

    # Рутинность и повторяемость (JSON структура)
    recurrence = Column(JSON, nullable=True)  # {"is_repeatable": true, "routine_type": "Routine", "recurrence_rule": "Daily"}

    # Relationship с Execution
    executions = relationship("Execution", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Task(id={self.id}, priority='{self.priority}', title='{self.title}')>"
