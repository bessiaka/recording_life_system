/**
 * API клиент для работы с задачами
 */

import { Task, TaskCreate, TaskUpdate } from '../types/task';

// Динамическое определение URL на основе window.location
const getApiBaseUrl = () => {
  // Если переменная окружения задана - используем её
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Иначе используем тот же хост что и frontend
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const host = window.location.hostname;
  return `${protocol}://${host}:8000`;
};

const API_BASE_URL = getApiBaseUrl();

// Генерируем уникальный ID сессии для этого клиента
export const SESSION_ID = `session_${Math.random().toString(36).substring(2, 15)}`;

class TaskAPI {
  /**
   * Получить все задачи
   */
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  }

  /**
   * Получить задачу по ID
   */
  async getTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch task ${id}`);
    }
    return response.json();
  }

  /**
   * Создать новую задачу
   */
  async createTask(task: TaskCreate): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID,
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  }

  /**
   * Обновить задачу
   */
  async updateTask(id: number, task: TaskUpdate): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID,
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Failed to update task ${id}`);
    }
    return response.json();
  }

  /**
   * Удалить задачу
   */
  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/`, {
      method: 'DELETE',
      headers: {
        'X-Session-ID': SESSION_ID,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete task ${id}`);
    }
  }
}

export const taskAPI = new TaskAPI();