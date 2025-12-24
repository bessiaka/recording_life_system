"""
REST API endpoints для работы с задачами Task v1
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import case
from typing import List
import logging

from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..websocket import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# Порядок приоритетов для сортировки (Task v1)
PRIORITY_ORDER = {
    "High": 1,
    "Medium": 2,
    "Low": 3
}


def get_session_id(request: Request) -> str:
    """Получить session_id из заголовка запроса"""
    return request.headers.get("X-Session-ID", "unknown")


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

    Args:
        task_data: Данные для создания задачи
        request: HTTP запрос (для получения session_id)

    Returns:
        TaskResponse: Созданная задача
    """
    session_id = get_session_id(request)

    # Создаём задачу Task v1
    db_task = Task(**task_data.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    logger.info(f"✅ Задача создана: ID={db_task.id}, title='{db_task.title}', session={session_id}")

    # Отправляем обновление всем подключенным клиентам
    await manager.broadcast({
        "type": "task_created",
        "task": TaskResponse.model_validate(db_task).model_dump(mode='json'),
        "session_id": session_id  # ← ДОБАВЛЕНО
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