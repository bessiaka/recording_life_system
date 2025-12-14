/**
 * Типы данных для задач
 */

export interface Task {
  id: number;
  priority: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: number;
}

export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted';
  task?: Task;
  task_id?: number;
  session_id?: string;  // ← ДОБАВЛЕНО
}