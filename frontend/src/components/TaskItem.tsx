/**
 * Компонент отдельной задачи
 */

import React, { useState } from 'react';
import { Task, Priority, Status, TaskType } from '../types/task';
import { taskAPI } from '../api/tasks';
import { format } from 'date-fns';
import { useTaskStore } from '../store/taskStore';

interface TaskItemProps {
  task: Task;
}

const getPriorityColor = (priority?: Priority): string => {
  switch (priority) {
    case 'Critical': return '#dc3545';
    case 'High': return '#fd7e14';
    case 'Medium': return '#ffc107';
    case 'Low': return '#28a745';
    case 'Lowest': return '#6c757d';
    default: return '#6c757d';
  }
};

const getPriorityIcon = (priority?: Priority): string => {
  switch (priority) {
    case 'Critical': return '🔴';
    case 'High': return '🟠';
    case 'Medium': return '🟡';
    case 'Low': return '🟢';
    case 'Lowest': return '⚪';
    default: return '⚪';
  }
};

const getStatusColor = (status?: Status): string => {
  switch (status) {
    case 'Done': return '#28a745';
    case 'In Progress': return '#007bff';
    case 'To Do': return '#ffc107';
    case 'Backlog': return '#6c757d';
    default: return '#6c757d';
  }
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Основные поля
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [type, setType] = useState<TaskType>(task.type || 'Task');
  const [status, setStatus] = useState<Status>(task.status || 'Backlog');
  const [priority, setPriority] = useState<Priority>(task.priority || 'Medium');

  // Сроки
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '');
  const [startDate, setStartDate] = useState(task.start_date ? task.start_date.split('T')[0] : '');
  const [scheduledTime, setScheduledTime] = useState(task.scheduled_time || '');

  // Планирование
  const [estimate, setEstimate] = useState(task.estimate || '');

  const handleSave = async () => {
    try {
      // Обновляем задачу на сервере
      const updatedTask = await taskAPI.updateTask(task.id, {
        title,
        description: description || undefined,
        type,
        status,
        priority,
        due_date: dueDate || undefined,
        start_date: startDate || undefined,
        scheduled_time: scheduledTime || undefined,
        estimate: estimate || undefined,
      });

      // ✅ Оптимистичное обновление - сразу обновляем в store
      console.log('✨ Оптимистичное обновление: обновляем задачу в store');
      updateTask(updatedTask);

      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      alert('Не удалось обновить задачу');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить эту задачу?')) {
      try {
        // ✅ Оптимистичное удаление - сразу удаляем из store
        console.log('✨ Оптимистичное удаление: удаляем задачу из store');
        deleteTask(task.id);

        // Удаляем задачу на сервере
        await taskAPI.deleteTask(task.id);
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        alert('Не удалось удалить задачу');
        // TODO: можно откатить удаление в случае ошибки
      }
    }
  };

  if (isEditing) {
    return (
      <div style={styles.taskItem}>
        <div style={styles.editForm}>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Тип:</label>
              <select value={type} onChange={(e) => setType(e.target.value as TaskType)} style={styles.select}>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Chore">Chore</option>
                <option value="Spike">Spike</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Приоритет:</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={styles.select}>
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
                <option value="Lowest">⚪ Lowest</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Статус:</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} style={styles.select}>
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Заголовок:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.titleInput}
              placeholder="Заголовок задачи"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Описание:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.descriptionInput}
              placeholder="Описание (необязательно)"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Начало:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Время:</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={styles.input}
                step="60"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Дедлайн:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Оценка:</label>
              <input
                type="text"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                style={styles.input}
                placeholder="2h, 3d, 5 SP"
              />
            </div>
          </div>

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
      {/* Заголовок задачи */}
      <div style={styles.taskHeader}>
        <div style={styles.taskHeaderLeft}>
          <span style={{ ...styles.key, color: getPriorityColor(task.priority) }}>
            {task.key || `#${task.id}`}
          </span>
          <span style={{ ...styles.badge, backgroundColor: getStatusColor(task.status) }}>
            {task.status || 'Backlog'}
          </span>
          {task.type && task.type !== 'Task' && (
            <span style={{ ...styles.badge, backgroundColor: '#6c757d' }}>
              {task.type}
            </span>
          )}
        </div>
        <div style={styles.taskHeaderRight}>
          <span style={styles.priority}>
            {getPriorityIcon(task.priority)} {task.priority || 'Medium'}
          </span>
        </div>
      </div>

      {/* Заголовок */}
      <h3 style={styles.title}>{task.title}</h3>

      {/* Описание */}
      {task.description && <p style={styles.description}>{task.description}</p>}

      {/* Дополнительная информация */}
      {isExpanded && (
        <div style={styles.details}>
          {/* Сроки */}
          {(task.start_date || task.due_date || task.scheduled_time || task.estimate) && (
            <div style={styles.detailSection}>
              <strong>Планирование:</strong>
              {task.start_date && <div>📅 Начало: {format(new Date(task.start_date), 'dd.MM.yyyy')}</div>}
              {task.scheduled_time && <div>🕐 Время: {task.scheduled_time.substring(0, 5)}</div>}
              {task.due_date && <div>⏰ Дедлайн: {format(new Date(task.due_date), 'dd.MM.yyyy')}</div>}
              {task.estimate && <div>⏱️ Оценка: {task.estimate}</div>}
            </div>
          )}

          {/* Контекст выполнения */}
          {(task.location || task.environment || task.connectivity || task.execution_mode) && (
            <div style={styles.detailSection}>
              <strong>Контекст:</strong>
              {task.location && <div>📍 Место: {task.location}</div>}
              {task.environment && <div>🎵 Окружение: {task.environment}</div>}
              {task.connectivity && <div>🌐 Сеть: {task.connectivity}</div>}
              {task.execution_mode && <div>👥 Режим: {task.execution_mode}</div>}
            </div>
          )}

          {/* Инструменты */}
          {task.tools_required && task.tools_required.length > 0 && (
            <div style={styles.detailSection}>
              <strong>Инструменты:</strong>
              <div>{task.tools_required.join(', ')}</div>
            </div>
          )}

          {/* Теги */}
          {task.labels && task.labels.length > 0 && (
            <div style={styles.detailSection}>
              <strong>Теги:</strong>
              <div style={styles.tags}>
                {task.labels.map((label, idx) => (
                  <span key={idx} style={styles.tag}>{label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Рутинность */}
          {task.is_repeatable && (
            <div style={styles.detailSection}>
              <strong>Повторяемая задача</strong>
              {task.recurrence_rule && <div>🔁 Правило: {task.recurrence_rule}</div>}
              {task.routine_type && <div>📋 Тип: {task.routine_type}</div>}
            </div>
          )}

          {/* Даты создания и обновления */}
          <div style={styles.detailSection}>
            <div style={styles.dates}>
              <span>Создано: {format(new Date(task.created_at), 'dd.MM.yyyy HH:mm')}</span>
              <span>Обновлено: {format(new Date(task.updated_at), 'dd.MM.yyyy HH:mm')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div style={styles.buttonGroup}>
        <button onClick={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
          {isExpanded ? '▲ Свернуть' : '▼ Подробнее'}
        </button>
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
  } as React.CSSProperties,
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '12px',
  } as React.CSSProperties,
  taskHeaderLeft: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  taskHeaderRight: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  } as React.CSSProperties,
  key: {
    fontWeight: 'bold',
    fontSize: '14px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#fff',
  } as React.CSSProperties,
  priority: {
    fontWeight: 'bold',
    fontSize: '12px',
  } as React.CSSProperties,
  title: {
    margin: '8px 0',
    fontSize: '18px',
    fontWeight: '600',
  } as React.CSSProperties,
  description: {
    color: '#666',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap' as const,
  } as React.CSSProperties,
  details: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '14px',
  } as React.CSSProperties,
  detailSection: {
    marginBottom: '12px',
  } as React.CSSProperties,
  dates: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#999',
  } as React.CSSProperties,
  tags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
    marginTop: '6px',
  } as React.CSSProperties,
  tag: {
    padding: '3px 8px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '11px',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  } as React.CSSProperties,
  expandButton: {
    padding: '6px 12px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  } as React.CSSProperties,
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  } as React.CSSProperties,
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  } as React.CSSProperties,
  editForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,
  formGroup: {
    flex: 1,
  } as React.CSSProperties,
  row: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  label: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '600',
    fontSize: '12px',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  titleInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  descriptionInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  saveButton: {
    flex: 1,
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  cancelButton: {
    flex: 1,
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
};
