/**
 * Zustand store для управления состоянием Task v1 и Execution v1
 */

import { create } from 'zustand';
import { Task, Priority, Execution } from '../types/task';

// Порядок приоритетов для сортировки (Task v1)
const PRIORITY_ORDER: Record<Priority, number> = {
  'High': 1,
  'Medium': 2,
  'Low': 3,
};

/**
 * Функция сортировки задач по приоритету
 */
const sortTasks = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority || 'Medium'] || 99;
    const priorityB = PRIORITY_ORDER[b.priority || 'Medium'] || 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Если приоритеты одинаковые, сортируем по дате создания
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};

interface TaskStore {
  // Task state
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Execution state
  executions: Execution[];
  executionsLoading: boolean;

  // Task actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Execution actions
  setExecutions: (executions: Execution[]) => void;
  addExecution: (execution: Execution) => void;
  setExecutionsLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  // Task state
  tasks: [],
  isLoading: false,
  error: null,

  // Execution state
  executions: [],
  executionsLoading: false,

  // Task actions
  setTasks: (tasks) =>
    set({
      tasks: sortTasks(tasks),
    }),

  addTask: (task) =>
    set((state) => {
      // Проверяем: задача уже есть?
      const exists = state.tasks.some((t) => t.id === task.id);
      if (exists) {
        console.warn('⚠️  Задача уже существует, пропускаем дубликат:', task.id);
        return state;
      }

      console.log('➕ Добавляем новую задачу в store:', task.title);
      return {
        tasks: sortTasks([...state.tasks, task]),
      };
    }),

  updateTask: (task) =>
    set((state) => ({
      tasks: sortTasks(
        state.tasks.map((t) => (t.id === task.id ? task : t))
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // Execution actions
  setExecutions: (executions) =>
    set({
      executions,
    }),

  addExecution: (execution) =>
    set((state) => {
      // Проверяем: execution уже есть?
      const exists = state.executions.some((e) => e.id === execution.id);
      if (exists) {
        console.warn('⚠️  Execution уже существует, пропускаем дубликат:', execution.id);
        return state;
      }

      console.log('✅ Добавляем новый execution в store:', execution.id);
      return {
        executions: [execution, ...state.executions],  // Новые сверху
      };
    }),

  setExecutionsLoading: (loading) => set({ executionsLoading: loading }),
}));