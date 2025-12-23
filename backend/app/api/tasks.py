"""
REST API endpoints для работы с задачами
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import case
from typing import List
from datetime import datetime, timedelta, time as dt_time, date as dt_date
import logging

from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..websocket import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# Порядок приоритетов для сортировки
PRIORITY_ORDER = {
    "Critical": 1,
    "High": 2,
    "Medium": 3,
    "Low": 4,
    "Lowest": 5
}


def get_session_id(request: Request) -> str:
    """Получить session_id из заголовка запроса"""
    return request.headers.get("X-Session-ID", "unknown")


def generate_task_key(task_id: int) -> str:
    """Генерирует человекочитаемый ключ задачи"""
    return f"TASK-{task_id}"


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """
    Получить все задачи, отсортированные по приоритету

    Returns:
        List[TaskResponse]: Список всех задач
    """
    # Создаем CASE для сортировки по приоритету
    priority_case = case(
        {priority: order for priority, order in PRIORITY_ORDER.items()},
        value=Task.priority,
        else_=99  # Для неизвестных приоритетов
    )

    tasks = db.query(Task).order_by(priority_case, Task.created_at).all()
    logger.info(f"📋 Получено задач: {len(tasks)}")
    return tasks


@router.get("/{task_id}/", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """
    Получить задачу по ID

    Args:
        task_id: ID задачи

    Returns:
        TaskResponse: Задача

    Raises:
        HTTPException: 404 если задача не найдена
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задача с ID {task_id} не найдена"
        )
    return task


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Создать новую задачу

    Если задача повторяемая, создаются дубликаты с интервалом по времени

    Args:
        task_data: Данные для создания задачи
        request: HTTP запрос (для получения session_id)

    Returns:
        TaskResponse: Созданная задача (первая в серии)
    """
    session_id = get_session_id(request)

    # Создаём основную задачу
    db_task = Task(**task_data.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Генерируем уникальный ключ после получения ID
    if not db_task.key:
        db_task.key = generate_task_key(db_task.id)
        db.commit()
        db.refresh(db_task)

    logger.info(f"✅ Задача создана: ID={db_task.id}, key='{db_task.key}', title='{db_task.title}', session={session_id}")

    # Отправляем обновление всем подключенным клиентам
    await manager.broadcast({
        "type": "task_created",
        "task": TaskResponse.model_validate(db_task).model_dump(mode='json'),
        "session_id": session_id
    })

    # Создаем дубликаты для повторяемых задач
    if (db_task.is_repeatable and
        db_task.recurrence_interval_hours and
        db_task.recurrence_count and
        db_task.recurrence_count > 1 and
        db_task.scheduled_time and
        db_task.start_date):

        logger.info(f"🔁 Создание {db_task.recurrence_count - 1} дубликатов для повторяемой задачи")

        # Парсим начальные дату и время
        current_date = db_task.start_date
        current_time = db_task.scheduled_time

        # Создаем дубликаты
        for i in range(1, db_task.recurrence_count):
            # Вычисляем новое время
            time_parts = str(current_time).split(':')
            hours = int(time_parts[0])
            minutes = int(time_parts[1]) if len(time_parts) > 1 else 0

            # Добавляем интервал в часах
            total_minutes = hours * 60 + minutes + (db_task.recurrence_interval_hours * 60)
            new_hours = (total_minutes // 60) % 24
            new_minutes = total_minutes % 60

            # Если время перешло на следующий день
            days_to_add = total_minutes // (24 * 60)
            if days_to_add > 0:
                current_date = current_date + timedelta(days=days_to_add)

            # Создаем новое время
            current_time = dt_time(hour=new_hours, minute=new_minutes)

            # Создаем дубликат задачи
            duplicate_data = task_data.model_dump()
            duplicate_data['start_date'] = current_date
            duplicate_data['scheduled_time'] = current_time
            duplicate_data['title'] = f"{task_data.title} (повтор {i+1})"

            duplicate_task = Task(**duplicate_data)
            db.add(duplicate_task)
            db.commit()
            db.refresh(duplicate_task)

            # Генерируем ключ
            if not duplicate_task.key:
                duplicate_task.key = generate_task_key(duplicate_task.id)
                db.commit()
                db.refresh(duplicate_task)

            logger.info(f"  ➕ Дубликат создан: ID={duplicate_task.id}, время={current_time}, дата={current_date}")

            # Отправляем обновление
            await manager.broadcast({
                "type": "task_created",
                "task": TaskResponse.model_validate(duplicate_task).model_dump(mode='json'),
                "session_id": session_id
            })

    return db_task


@router.put("/{task_id}/", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Обновить задачу

    Args:
        task_id: ID задачи
        task_data: Данные для обновления
        request: HTTP запрос (для получения session_id)

    Returns:
        TaskResponse: Обновлённая задача

    Raises:
        HTTPException: 404 если задача не найдена
    """
    session_id = get_session_id(request)

    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задача с ID {task_id} не найдена"
        )

    # Обновляем только переданные поля
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    logger.info(f"✏️ Задача обновлена: ID={db_task.id}, session={session_id}")

    # Отправляем обновление всем подключенным клиентам
    await manager.broadcast({
        "type": "task_updated",
        "task": TaskResponse.model_validate(db_task).model_dump(mode='json'),
        "session_id": session_id  # ← ДОБАВЛЕНО
    })

    return db_task


@router.delete("/{task_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Удалить задачу

    Args:
        task_id: ID задачи
        request: HTTP запрос (для получения session_id)

    Raises:
        HTTPException: 404 если задача не найдена
    """
    session_id = get_session_id(request)

    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задача с ID {task_id} не найдена"
        )

    db.delete(db_task)
    db.commit()

    logger.info(f"🗑️  Задача удалена: ID={task_id}, session={session_id}")

    # Отправляем обновление всем подключенным клиентам
    await manager.broadcast({
        "type": "task_deleted",
        "task_id": task_id,
        "session_id": session_id  # ← ДОБАВЛЕНО
    })

    return None