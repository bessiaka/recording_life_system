/**
 * Custom hook для работы с WebSocket
 */

import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '../types/task';
import { useTaskStore } from '../store/taskStore';
import { SESSION_ID } from '../api/tasks';

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;
  return `${protocol}://${host}:8000/ws`;
};

const WS_URL = getWsUrl();

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const { addTask, updateTask, deleteTask } = useTaskStore();

  const connect = () => {
    // ✅ Закрываем ТОЛЬКО если соединение открыто
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🔌 Закрываем старое ОТКРЫТОЕ соединение');
      wsRef.current.close(1000, 'Reconnecting');
      wsRef.current = null;
    }

    // ✅ Если соединение уже закрывается/закрыто - просто очищаем ссылку
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CONNECTING) {
      console.log('🧹 Очищаем ссылку на закрытое соединение');
      wsRef.current = null;
    }

    try {
      console.log('🔌 Подключение к WebSocket:', WS_URL);
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('✅ WebSocket подключен. Session ID:', SESSION_ID);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📩 WebSocket сообщение:', message);

          if (message.session_id === SESSION_ID) {
            console.log('⏭️  Пропускаем своё событие (session_id совпадает)');
            return;
          }

          switch (message.type) {
            case 'task_created':
              if (message.task) {
                console.log('➕ Добавляем задачу из WebSocket:', message.task.title);
                addTask(message.task);
              }
              break;
            case 'task_updated':
              if (message.task) {
                console.log('✏️  Обновляем задачу из WebSocket:', message.task.title);
                updateTask(message.task);
              }
              break;
            case 'task_deleted':
              if (message.task_id) {
                console.log('🗑️  Удаляем задачу из WebSocket:', message.task_id);
                deleteTask(message.task_id);
              }
              break;
          }
        } catch (error) {
          console.error('Ошибка обработки WebSocket сообщения:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket ошибка:', error);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket отключен. Code:', event.code, 'Reason:', event.reason);
        setIsConnected(false);

        // ✅ Только если wsRef указывает на ЭТОТ websocket
        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        // Очищаем предыдущий таймер
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Переподключение только если не закрыто нормально
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Переподключение через 3 секунды...');
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Ошибка создания WebSocket:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 Cleanup: закрываем WebSocket');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, []);

  return { isConnected };
};