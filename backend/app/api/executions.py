"""
REST API endpoints для работы с Execution v1 (фиксация фактов)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import logging

from ..database import get_db
from ..models import Task, Execution
from ..schemas import ExecutionCreate, ExecutionResponse
from ..websocket import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/executions", tags=["executions"])


def get_session_id(request: Request) -> str:
    """Получить session_id из заголовка запроса"""
    return request.headers.get("X-Session-ID", "unknown")


@router.post("/", response_model=ExecutionResponse, status_code=status.HTTP_201_CREATED)
async def create_execution(
    execution_data: ExecutionCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Создать новую запись о выполнении задачи (фиксация факта)

    Args:
        execution_data: Данные о выполнении
        request: HTTP запрос (для получения session_id)

    Returns:
        ExecutionResponse: Созданная запись

    Raises:
        HTTPException: 404 если задача не найдена
    """
    session_id = get_session_id(request)

    # Проверяем существование задачи
    task = db.query(Task).filter(Task.id == execution_data.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задача с ID {execution_data.task_id} не найдена"
        )

    # Создаём запись о выполнении
    db_execution = Execution(**execution_data.model_dump())
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)

    logger.info(f"✅ Execution создан: ID={db_execution.id}, task_id={db_execution.task_id}, status='{db_execution.status}', session={session_id}")

    # Отправляем обновление всем подключенным клиентам
    await manager.broadcast({
        "type": "execution_created",
        "execution": ExecutionResponse.model_validate(db_execution).model_dump(mode='json'),
        "session_id": session_id
    })

    return db_execution


@router.get("/task/{task_id}/", response_model=List[ExecutionResponse])
async def get_task_executions(task_id: int, db: Session = Depends(get_db)):
    """
    Получить все записи о выполнении для конкретной задачи

    Args:
        task_id: ID задачи

    Returns:
        List[ExecutionResponse]: Список записей о выполнении

    Raises:
        HTTPException: 404 если задача не найдена
    """
    # Проверяем существование задачи
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задача с ID {task_id} не найдена"
        )

    # Получаем все executions для этой задачи, сортируем по дате создания (новые сверху)
    executions = db.query(Execution).filter(
        Execution.task_id == task_id
    ).order_by(Execution.created_at.desc()).all()

    logger.info(f"📋 Получено executions для задачи {task_id}: {len(executions)}")
    return executions


@router.get("/", response_model=List[ExecutionResponse])
async def get_all_executions(db: Session = Depends(get_db)):
    """
    Получить все записи о выполнении, отсортированные по дате (новые сверху)

    Returns:
        List[ExecutionResponse]: Список всех записей
    """
    executions = db.query(Execution).order_by(Execution.created_at.desc()).all()
    logger.info(f"📋 Получено всего executions: {len(executions)}")
    return executions
