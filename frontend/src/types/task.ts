/**
 * Типы данных для Task v1 и Execution v1
 * Recording Life System - Intent (намерение) + Fact (фиксация)
 */

// ============================================================================
// TASK V1 - INTENT (Намерение)
// ============================================================================

// Типы задач
export type TaskType = 'Task' | 'Bug' | 'Chore';

// Типы статуса (status = Done означает что ожидание больше не актуально!)
export type TaskStatus = 'Backlog' | 'Active' | 'Done' | 'Archived';

// Типы приоритета
export type Priority = 'Low' | 'Medium' | 'High';

// Типы места выполнения
export type Location = 'Home' | 'Office' | 'Anywhere';

// Типы connectivity
export type Connectivity = 'Online' | 'Offline';

// Типы рутины
export type RoutineType = 'Routine' | 'Ad-hoc';

/**
 * Контекст выполнения задачи
 */
export interface TaskContext {
  location?: Location;
  tools_required?: string[];
  connectivity?: Connectivity;
}

/**
 * Информация о повторяемости задачи
 */
export interface TaskRecurrence {
  is_repeatable: boolean;
  routine_type?: RoutineType;
  recurrence_rule?: string;  // Daily, Weekly, Cron expression
}

/**
 * Task v1 - Декларация намерения (Intent)
 *
 * Task отвечает на вопросы:
 * - Что это за ожидание?
 * - Насколько оно важно?
 * - Повторяется ли оно?
 * - В каком контексте его можно выполнять?
 */
export interface Task {
  // Идентификация и описание
  id: number;
  title: string;
  description?: string;
  type: TaskType;

  // Управление жизненным циклом
  status: TaskStatus;
  priority: Priority;
  created_at: string;
  updated_at: string;

  // Планирование (минимум)
  due_date?: string;

  // Контекст выполнения
  context?: TaskContext;

  // Рутинность и повторяемость
  recurrence?: TaskRecurrence;
}

/**
 * Схема для создания Task
 */
export interface TaskCreate {
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  due_date?: string;
  context?: TaskContext;
  recurrence?: TaskRecurrence;
}

/**
 * Схема для обновления Task
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  due_date?: string;
  context?: TaskContext;
  recurrence?: TaskRecurrence;
}

// ============================================================================
// EXECUTION V1 - FACT (Фиксация факта)
// ============================================================================

// Статусы выполнения
export type ExecutionStatus = 'completed' | 'failed' | 'skipped' | 'partial';

// Способ записи
export type RecordedBy = 'manual' | 'auto';

/**
 * Execution v1 - Фиксация факта выполнения
 *
 * Execution отвечает на вопросы:
 * - Что реально произошло?
 * - Когда?
 * - Чем закончилось?
 * - Какие данные я хочу сохранить по факту?
 */
export interface Execution {
  // Связь
  id: number;
  task_id: number;

  // Результат попытки
  status: ExecutionStatus;

  // Временные параметры
  started_at?: string;
  ended_at?: string;
  duration?: number;  // в секундах

  // Фиксация данных (черный ящик)
  payload?: Record<string, any>;
  note?: string;

  // Метаданные
  recorded_by: RecordedBy;
  created_at: string;
}

/**
 * Схема для создания Execution
 */
export interface ExecutionCreate {
  task_id: number;
  status: ExecutionStatus;
  started_at?: string;
  ended_at?: string;
  duration?: number;
  payload?: Record<string, any>;
  note?: string;
  recorded_by?: RecordedBy;
}

// ============================================================================
// WEBSOCKET MESSAGES
// ============================================================================

export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'execution_created';
  task?: Task;
  execution?: Execution;
  task_id?: number;
  session_id?: string;
}
