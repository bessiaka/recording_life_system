/**
 * Типы данных для задач
 */

// Типы приоритета
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low' | 'Lowest';

// Типы статуса
export type Status = 'Backlog' | 'To Do' | 'In Progress' | 'Done';

// Типы задач
export type TaskType = 'Task' | 'Bug' | 'Chore' | 'Spike';

// Типы места выполнения
export type Location = 'Дом' | 'Работа' | 'Любое';

// Типы окружения
export type Environment = 'Тишина' | 'Фон';

// Типы connectivity
export type Connectivity = 'Online' | 'Offline';

// Типы execution mode
export type ExecutionMode = 'Solo' | 'Async' | 'Sync';

export interface Task {
  // 1.1. Идентификация и описание
  id: number;
  key?: string;  // TASK-123
  title: string;
  description?: string;
  type?: TaskType;

  // 1.2. Статус и жизненный цикл
  status?: Status;
  resolution?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;

  // 1.3. Ответственность и владение
  assignee?: string;
  reporter?: string;
  watchers?: string[];

  // 1.4. Приоритет и срочность
  priority?: Priority;
  severity?: string;
  due_date?: string;
  sla?: string;

  // 1.5. Планирование и оценка
  estimate?: string;
  original_estimate?: string;
  remaining_estimate?: string;
  time_spent?: string;
  start_date?: string;

  // 1.6. Связи и структура
  project_id?: number;
  parent_id?: number;
  subtasks?: number[];
  dependencies?: {
    blocked_by?: number[];
    blocks?: number[];
  };
  links?: number[];

  // 1.7. Классификация и группировка
  labels?: string[];
  components?: string[];
  epic_id?: number;
  sprint_id?: number;
  milestone?: string;

  // 2. Контекст выполнения
  location?: Location;
  tools_required?: string[];
  environment?: Environment;
  connectivity?: Connectivity;
  execution_mode?: ExecutionMode;

  // 3. Рутинность и повторяемость
  is_repeatable?: boolean;
  recurrence_rule?: string;
  routine_type?: string;
  maintenance_level?: string;
  skip_penalty?: string;
}

export interface TaskCreate {
  // Основные поля
  title: string;
  description?: string;
  type?: TaskType;

  // Статус и приоритет
  status?: Status;
  priority?: Priority;

  // Сроки
  due_date?: string;
  start_date?: string;

  // Планирование
  estimate?: string;

  // Связи
  project_id?: number;
  parent_id?: number;
  labels?: string[];

  // Контекст
  location?: Location;
  tools_required?: string[];
  environment?: Environment;
  connectivity?: Connectivity;
  execution_mode?: ExecutionMode;

  // Рутинность
  is_repeatable?: boolean;
  recurrence_rule?: string;
  routine_type?: string;
}

export interface TaskUpdate {
  // Основные поля
  title?: string;
  description?: string;
  type?: TaskType;

  // Статус и жизненный цикл
  status?: Status;
  resolution?: string;
  completed_at?: string;

  // Ответственность (пока не используется)
  assignee?: string;
  reporter?: string;
  watchers?: string[];

  // Приоритет и срочность
  priority?: Priority;
  severity?: string;
  due_date?: string;
  sla?: string;

  // Планирование и оценка
  estimate?: string;
  original_estimate?: string;
  remaining_estimate?: string;
  time_spent?: string;
  start_date?: string;

  // Связи и структура
  project_id?: number;
  parent_id?: number;
  subtasks?: number[];
  dependencies?: {
    blocked_by?: number[];
    blocks?: number[];
  };
  links?: number[];

  // Классификация и группировка
  labels?: string[];
  components?: string[];
  epic_id?: number;
  sprint_id?: number;
  milestone?: string;

  // Контекст выполнения
  location?: Location;
  tools_required?: string[];
  environment?: Environment;
  connectivity?: Connectivity;
  execution_mode?: ExecutionMode;

  // Рутинность и повторяемость
  is_repeatable?: boolean;
  recurrence_rule?: string;
  routine_type?: string;
  maintenance_level?: string;
  skip_penalty?: string;
}

export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted';
  task?: Task;
  task_id?: number;
  session_id?: string;
}