"""
SQLAlchemy модель для задач
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, Date, Time
from datetime import datetime

from ..database.session import Base


class Task(Base):
    """
    Модель задачи - расширенная IT-трекер модель

    Attributes:
        # 1.1. Идентификация и описание
        id: Уникальный идентификатор
        key: Человекочитаемый ключ (TASK-123)
        title: Краткое название задачи
        description: Развёрнутое описание
        type: Тип задачи (Task / Bug / Chore / Spike)

        # 1.2. Статус и жизненный цикл
        status: Backlog / To Do / In Progress / Done
        resolution: Fixed / Won't Do / Duplicate / Done
        created_at: Дата создания
        updated_at: Последнее обновление
        completed_at: Дата завершения

        # 1.3. Ответственность и владение
        assignee: Исполнитель
        reporter: Автор задачи
        watchers: Наблюдатели (список)

        # 1.4. Приоритет и срочность
        priority: Lowest / Low / Medium / High / Critical
        severity: Влияние на систему
        due_date: Дедлайн
        sla: Ограничения по времени

        # 1.5. Планирование и оценка
        estimate: Оценка (time / story points)
        original_estimate: Исходная оценка
        remaining_estimate: Остаток
        time_spent: Фактически потрачено
        start_date: Когда можно начинать
        scheduled_time: Время начала в течение дня (HH:MM)

        # 1.6. Связи и структура
        project_id: Проект
        parent_id: Родительская задача
        subtasks: Подзадачи (список ID)
        dependencies: Blocked by / Blocks (JSON)
        links: Связанные задачи (список ID)

        # 1.7. Классификация и группировка
        labels: Теги (список)
        components: Подсистема (список)
        epic_id: Epic
        sprint_id: Спринт
        milestone: Веха

        # 2. Контекст выполнения
        location: Дом / Работа / Любое
        tools_required: IDE, ноутбук, кухня (список)
        environment: Тишина / Фон
        connectivity: Online / Offline
        execution_mode: Solo / Async / Sync

        # 3. Рутинность и повторяемость
        is_repeatable: true / false
        recurrence_rule: Daily / Weekly / Cron
        routine_type: Routine / Ad-hoc
        maintenance_level: Core / Optional
        skip_penalty: Что будет, если пропустить
    """
    __tablename__ = "tasks"

    # 1.1. Идентификация и описание
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String(50), unique=True, index=True, nullable=True)  # TASK-123
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=True, default="Task")  # Task / Bug / Chore / Spike

    # 1.2. Статус и жизненный цикл
    status = Column(String(50), nullable=False, default="Backlog")  # Backlog / To Do / In Progress / Done
    resolution = Column(String(50), nullable=True)  # Fixed / Won't Do / Duplicate / Done
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # 1.3. Ответственность и владение
    assignee = Column(String(100), nullable=True)
    reporter = Column(String(100), nullable=True)
    watchers = Column(JSON, nullable=True)  # Список наблюдателей

    # 1.4. Приоритет и срочность
    priority = Column(String(50), nullable=False, default="Medium")  # Lowest / Low / Medium / High / Critical
    severity = Column(String(50), nullable=True)
    due_date = Column(Date, nullable=True)
    sla = Column(String(100), nullable=True)

    # 1.5. Планирование и оценка
    estimate = Column(String(50), nullable=True)  # time / story points
    original_estimate = Column(String(50), nullable=True)
    remaining_estimate = Column(String(50), nullable=True)
    time_spent = Column(String(50), nullable=True)
    start_date = Column(Date, nullable=True)
    scheduled_time = Column(Time, nullable=True)  # Время начала в течение дня (HH:MM)

    # 1.6. Связи и структура
    project_id = Column(Integer, nullable=True)
    parent_id = Column(Integer, nullable=True)
    subtasks = Column(JSON, nullable=True)  # Список ID подзадач
    dependencies = Column(JSON, nullable=True)  # {"blocked_by": [1, 2], "blocks": [3, 4]}
    links = Column(JSON, nullable=True)  # Список ID связанных задач

    # 1.7. Классификация и группировка
    labels = Column(JSON, nullable=True)  # Список тегов
    components = Column(JSON, nullable=True)  # Список компонентов
    epic_id = Column(Integer, nullable=True)
    sprint_id = Column(Integer, nullable=True)
    milestone = Column(String(100), nullable=True)

    # 2. Контекст выполнения
    location = Column(String(50), nullable=True)  # Дом / Работа / Любое
    tools_required = Column(JSON, nullable=True)  # Список инструментов
    environment = Column(String(50), nullable=True)  # Тишина / Фон
    connectivity = Column(String(50), nullable=True)  # Online / Offline
    execution_mode = Column(String(50), nullable=True)  # Solo / Async / Sync

    # 3. Рутинность и повторяемость
    is_repeatable = Column(Boolean, nullable=False, default=False)
    recurrence_rule = Column(String(100), nullable=True)  # Daily / Weekly / Cron
    routine_type = Column(String(50), nullable=True)  # Routine / Ad-hoc
    maintenance_level = Column(String(50), nullable=True)  # Core / Optional
    skip_penalty = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Task(id={self.id}, key='{self.key}', priority='{self.priority}', title='{self.title}')>"
