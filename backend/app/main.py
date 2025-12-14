"""
Главное FastAPI приложение
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from .api import tasks
from .websocket import manager
from .database import Base, engine

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

# Создание таблиц в БД
logger.info("🗄️  Создание таблиц в базе данных...")
Base.metadata.create_all(bind=engine)
logger.info("✅ Таблицы созданы")

# Создание FastAPI приложения
app = FastAPI(
    title="Todo Voice API",
    description="Backend API для Todo приложения с голосовым управлением",
    version="1.0.0"
)

# CORS middleware для доступа с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(tasks.router)


@app.get("/")
async def root():
    """Корневой endpoint"""
    return {
        "message": "Todo Voice API",
        "version": "1.0.0",
        "endpoints": {
            "tasks": "/api/tasks",
            "websocket": "/ws",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint для real-time обновлений

    Клиенты подключаются сюда и получают broadcast сообщения
    о создании/обновлении/удалении задач
    """
    await manager.connect(websocket)
    try:
        # Держим соединение открытым
        while True:
            # Ждём сообщений от клиента (опционально)
            data = await websocket.receive_text()
            logger.debug(f"Получено от клиента: {data}")

            # Можно обрабатывать входящие сообщения если нужно
            # Например, ping/pong для keep-alive

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Клиент отключился")
    except Exception as e:
        logger.error(f"WebSocket ошибка: {e}")
        manager.disconnect(websocket)


@app.on_event("startup")
async def startup_event():
    """Действия при запуске приложения"""
    logger.info("🚀 Todo Voice API запущен")


@app.on_event("shutdown")
async def shutdown_event():
    """Действия при остановке приложения"""
    logger.info("🛑 Todo Voice API остановлен")