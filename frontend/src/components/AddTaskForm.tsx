/**
 * Упрощенная форма создания Task v1 (Intent - намерение)
 */
import React, { useState } from 'react';
import { TaskCreate, TaskContext, TaskRecurrence } from '../types/task';
import { taskAPI } from '../api/tasks';
import { useTaskStore } from '../store/taskStore';

export const AddTaskForm: React.FC = () => {
  const { setError } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);

  // Основные поля
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Task' | 'Bug' | 'Chore'>('Task');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [status, setStatus] = useState<'Backlog' | 'Active' | 'Done' | 'Archived'>('Backlog');
  const [dueDate, setDueDate] = useState('');

  // Контекст выполнения
  const [location, setLocation] = useState<'Home' | 'Office' | 'Anywhere'>('Anywhere');
  const [toolsRequired, setToolsRequired] = useState('');
  const [connectivity, setConnectivity] = useState<'Online' | 'Offline'>('Online');

  // Рутинность
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [routineType, setRoutineType] = useState<'Routine' | 'Ad-hoc'>('Ad-hoc');
  const [recurrenceRule, setRecurrenceRule] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Название задачи обязательно');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const context: TaskContext = {
        location,
        tools_required: toolsRequired ? toolsRequired.split(',').map(t => t.trim()) : undefined,
        connectivity,
      };

      const recurrence: TaskRecurrence = {
        is_repeatable: isRepeatable,
        routine_type: isRepeatable ? routineType : undefined,
        recurrence_rule: isRepeatable && recurrenceRule ? recurrenceRule : undefined,
      };

      const taskData: TaskCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        status,
        due_date: dueDate || undefined,
        context,
        recurrence,
      };

      await taskAPI.createTask(taskData);

      // Очистить форму
      setTitle('');
      setDescription('');
      setType('Task');
      setPriority('Medium');
      setStatus('Backlog');
      setDueDate('');
      setLocation('Anywhere');
      setToolsRequired('');
      setConnectivity('Online');
      setIsRepeatable(false);
      setRoutineType('Ad-hoc');
      setRecurrenceRule('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка создания задачи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Создать намерение (Task v1)</h2>

      {/* Основное */}
      <div style={styles.section}>
        <input
          type="text"
          placeholder="Название задачи *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          rows={3}
        />

        <div style={styles.row}>
          <select value={type} onChange={(e) => setType(e.target.value as any)} style={styles.select}>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Chore">Chore</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} style={styles.select}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={styles.select}>
            <option value="Backlog">Backlog</option>
            <option value="Active">Active</option>
            <option value="Done">Done</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={styles.input}
          placeholder="Дедлайн"
        />
      </div>

      {/* Контекст выполнения */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Контекст выполнения</h3>

        <div style={styles.row}>
          <select value={location} onChange={(e) => setLocation(e.target.value as any)} style={styles.select}>
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Anywhere">Anywhere</option>
          </select>

          <select value={connectivity} onChange={(e) => setConnectivity(e.target.value as any)} style={styles.select}>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Инструменты (через запятую)"
          value={toolsRequired}
          onChange={(e) => setToolsRequired(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Рутинность */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Повторяемость</h3>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={isRepeatable}
            onChange={(e) => setIsRepeatable(e.target.checked)}
          />
          Повторяемая задача
        </label>

        {isRepeatable && (
          <>
            <select value={routineType} onChange={(e) => setRoutineType(e.target.value as any)} style={styles.select}>
              <option value="Routine">Routine</option>
              <option value="Ad-hoc">Ad-hoc</option>
            </select>

            <input
              type="text"
              placeholder="Правило повторения (Daily, Weekly, Cron)"
              value={recurrenceRule}
              onChange={(e) => setRecurrenceRule(e.target.value)}
              style={styles.input}
            />
          </>
        )}
      </div>

      <button type="submit" disabled={isLoading} style={styles.button}>
        {isLoading ? 'Создание...' : 'Создать намерение'}
      </button>
    </form>
  );
};

const styles = {
  form: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '10px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  select: {
    flex: 1,
    padding: '10px',
    marginRight: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  row: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
