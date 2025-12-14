/**
 * Zustand store для управления состоянием задач
 */

import { create } from 'zustand';
import { Task } from '../types/task';

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
      tasks: tasks.sort((a, b) => a.priority - b.priority),
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
        tasks: [...state.tasks, task].sort((a, b) => a.priority - b.priority),
      };
    }),

  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks
        .map((t) => (t.id === task.id ? task : t))
        .sort((a, b) => a.priority - b.priority),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));