/**
 * Zustand store для управления состоянием задач
 */

import { create } from 'zustand';
import { Task, Priority } from '../types/task';

// Порядок приоритетов для сортировки (совпадает с бэкендом)
const PRIORITY_ORDER: Record<Priority, number> = {
  'Critical': 1,
  'High': 2,
  'Medium': 3,
  'Low': 4,
  'Lowest': 5,
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
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) =>
    set({
      tasks: sortTasks(tasks),
    }),

  addTask: (task) =>
    set((state) => {
      // ✅ Проверяем: задача уже есть?
      const exists = state.tasks.some((t) => t.id === task.id);
      if (exists) {
        console.warn('⚠️  Задача уже существует, пропускаем дубликат:', task.id);
        return state;  // Не изменяем state
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
}));