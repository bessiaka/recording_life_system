/**
 * Список всех задач
 */

import React, { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { taskAPI } from '../api/tasks';
import { TaskItem } from './TaskItem';

export const TaskList: React.FC = () => {
  const { tasks, isLoading, error, setTasks, setLoading, setError } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await taskAPI.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
      setError('Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div style={styles.loading}>⏳ Загрузка задач...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>❌ {error}</p>
        <button onClick={loadTasks} style={styles.retryButton}>
          🔄 Попробовать снова
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={styles.empty}>
        <p>📝 Задач пока нет</p>
        <p style={styles.emptyHint}>Добавьте первую задачу!</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      <h2 style={styles.listTitle}>📋 Мои задачи ({tasks.length})</h2>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

const styles = {
  list: {
    marginTop: '20px',
  },
  listTitle: {
    marginBottom: '16px',
    color: '#333',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#dc3545',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#666',
  },
  emptyHint: {
    fontSize: '14px',
    color: '#999',
  },
};
