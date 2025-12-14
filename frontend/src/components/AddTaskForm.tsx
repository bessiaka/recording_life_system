/**
 * Форма добавления новой задачи
 */

import React, { useState } from 'react';
import { taskAPI } from '../api/tasks';

export const AddTaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Введите заголовок задачи');
      return;
    }

    try {
      await taskAPI.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });

      // Очистка формы
      setTitle('');
      setDescription('');
      setPriority(1);
      setIsOpen(false);
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      alert('Не удалось создать задачу');
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={styles.openButton}>
        ➕ Добавить задачу
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>➕ Новая задача</h3>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Приоритет:</label>
        <input
          type="number"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          style={styles.priorityInput}
          min="1"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Заголовок:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          placeholder="Что нужно сделать?"
          required
          autoFocus
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Описание (необязательно):</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          placeholder="Дополнительные детали..."
        />
      </div>

      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.submitButton}>
          ✅ Создать
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setTitle('');
            setDescription('');
            setPriority(1);
          }}
          style={styles.cancelButton}
        >
          ❌ Отмена
        </button>
      </div>
    </form>
  );
};

const styles = {
  openButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  form: {
    backgroundColor: '#f8f9fa',
    border: '2px solid #007bff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  formTitle: {
    margin: '0 0 16px 0',
    color: '#007bff',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '600',
    fontSize: '14px',
  },
  priorityInput: {
    width: '80px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
