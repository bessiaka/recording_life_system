/**
 * API клиент для работы с Task v1 и Execution v1
 */
import { Task, TaskCreate, TaskUpdate, Execution, ExecutionCreate } from '../types/task';

// Определяем API URL из переменной окружения или используем относительный путь
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000');

// Генерируем уникальный session ID для отслеживания своих изменений
export const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Базовый fetch с обработкой ошибок и session ID
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': SESSION_ID,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Для 204 No Content не парсим JSON
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================================================
// TASK V1 API
// ============================================================================

export const taskAPI = {
  /**
   * Получить все задачи
   */
  async getTasks(): Promise<Task[]> {
    return apiFetch<Task[]>('/api/tasks/');
  },

  /**
   * Получить задачу по ID
   */
  async getTask(id: number): Promise<Task> {
    return apiFetch<Task>(`/api/tasks/${id}/`);
  },

  /**
   * Создать новую задачу
   */
  async createTask(task: TaskCreate): Promise<Task> {
    return apiFetch<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  /**
   * Обновить задачу
   */
  async updateTask(id: number, task: TaskUpdate): Promise<Task> {
    return apiFetch<Task>(`/api/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  /**
   * Удалить задачу
   */
  async deleteTask(id: number): Promise<void> {
    return apiFetch<void>(`/api/tasks/${id}/`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// EXECUTION V1 API
// ============================================================================

export const executionAPI = {
  /**
   * Создать новую запись о выполнении (фиксация факта)
   */
  async createExecution(execution: ExecutionCreate): Promise<Execution> {
    return apiFetch<Execution>('/api/executions/', {
      method: 'POST',
      body: JSON.stringify(execution),
    });
  },

  /**
   * Получить все записи о выполнении для конкретной задачи
   */
  async getTaskExecutions(taskId: number): Promise<Execution[]> {
    return apiFetch<Execution[]>(`/api/executions/task/${taskId}/`);
  },

  /**
   * Получить все записи о выполнении
   */
  async getAllExecutions(): Promise<Execution[]> {
    return apiFetch<Execution[]>('/api/executions/');
  },
};

// Экспортируем для обратной совместимости
export default taskAPI;
