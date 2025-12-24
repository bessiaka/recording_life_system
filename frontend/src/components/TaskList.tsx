/**
 * Список всех Tasks v1
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
    try {
      setLoading(true);
      setError(null);
      const data = await taskAPI.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div style={styles.message}>Загрузка намерений...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>Ошибка: {error}</p>
        <button onClick={loadTasks} style={styles.retryButton}>
          Попробовать снова
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <div style={styles.empty}>Нет намерений. Создайте первое!</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Намерения (Tasks v1)</h2>
        <span style={styles.count}>{tasks.length}</span>
      </div>

      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#333',
  },
  count: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
  },
  message: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#6c757d',
    fontSize: '16px',
  },
  error: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#dc3545',
  },
  retryButton: {
    marginTop: '16px',
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
    color: '#6c757d',
    fontSize: '18px',
  },
};
