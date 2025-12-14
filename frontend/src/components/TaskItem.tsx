/**
 * Компонент отдельной задачи
 */

import React, { useState } from 'react';
import { Task } from '../types/task';
import { taskAPI } from '../api/tasks';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);

  const handleSave = async () => {
    try {
      await taskAPI.updateTask(task.id, {
        title,
        description: description || undefined,
        priority,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      alert('Не удалось обновить задачу');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить эту задачу?')) {
      try {
        await taskAPI.deleteTask(task.id);
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        alert('Не удалось удалить задачу');
      }
    }
  };

  if (isEditing) {
    return (
      <div style={styles.taskItem}>
        <div style={styles.editForm}>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            style={styles.priorityInput}
            min="1"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.titleInput}
            placeholder="Заголовок задачи"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.descriptionInput}
            placeholder="Описание (необязательно)"
          />
          <div style={styles.buttonGroup}>
            <button onClick={handleSave} style={styles.saveButton}>
              ✅ Сохранить
            </button>
            <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>
              ❌ Отмена
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.taskItem}>
      <div style={styles.taskHeader}>
        <span style={styles.priority}>#{task.priority}</span>
        <span style={styles.date}>
          {format(new Date(task.created_at), 'dd.MM.yyyy HH:mm')}
        </span>
      </div>
      <h3 style={styles.title}>{task.title}</h3>
      {task.description && <p style={styles.description}>{task.description}</p>}
      <div style={styles.buttonGroup}>
        <button onClick={() => setIsEditing(true)} style={styles.editButton}>
          ✏️ Изменить
        </button>
        <button onClick={handleDelete} style={styles.deleteButton}>
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
};

const styles = {
  taskItem: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#666',
  },
  priority: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  date: {
    color: '#999',
  },
  title: {
    margin: '8px 0',
    fontSize: '18px',
    fontWeight: '600',
  },
  description: {
    color: '#666',
    marginBottom: '12px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  priorityInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    width: '80px',
  },
  titleInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  descriptionInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
