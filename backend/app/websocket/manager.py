"""
WebSocket Connection Manager
Управляет подключениями и broadcast сообщений всем клиентам
"""
from fastapi import WebSocket
from typing import List
import logging
import json

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Менеджер WebSocket соединений
    
    Отвечает за:
    - Подключение/отключение клиентов
    - Broadcast сообщений всем подключенным клиентам
    - Обработку отключенных соединений
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """
        Подключение нового клиента
        
        Args:
            websocket: WebSocket соединение
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"✅ Новый клиент подключен. Всего клиентов: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Отключение клиента
        
        Args:
            websocket: WebSocket соединение
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"❌ Клиент отключен. Всего клиентов: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """
        Отправка сообщения всем подключенным клиентам
        
        Args:
            message: Словарь с данными для отправки
        """
        disconnected = []
        
        logger.debug(f"📢 Broadcast: {message.get('type')} → {len(self.active_connections)} клиентов")
        
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Ошибка отправки сообщения: {e}")
                disconnected.append(connection)
        
        # Удаляем отключенные соединения
        for conn in disconnected:
            self.disconnect(conn)
    
    async def send_personal(self, message: dict, websocket: WebSocket):
        """
        Отправка сообщения конкретному клиенту
        
        Args:
            message: Словарь с данными
            websocket: WebSocket соединение получателя
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Ошибка отправки личного сообщения: {e}")
            self.disconnect(websocket)


# Глобальный экземпляр менеджера
manager = ConnectionManager()
