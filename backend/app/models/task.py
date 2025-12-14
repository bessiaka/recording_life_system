"""
SQLAlchemy модель для задач
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from ..database.session import Base


class Task(Base):
    """
    Модель задачи
    
    Attributes:
        id: Уникальный идентификатор
        priority: Приоритет/порядковый номер (чем меньше, тем выше)
        title: Заголовок задачи
        description: Описание/комментарий к задаче
        created_at: Дата создания
        updated_at: Дата последнего обновления
    """
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    priority = Column(Integer, nullable=False, default=999)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Task(id={self.id}, priority={self.priority}, title='{self.title}')>"
