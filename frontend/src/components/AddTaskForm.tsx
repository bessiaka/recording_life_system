/**
 * Форма добавления новой задачи
 */

import React, { useState } from 'react';
import { taskAPI } from '../api/tasks';
import { Priority, Status, TaskType, Location, Environment, Connectivity, ExecutionMode } from '../types/task';
import { useTaskStore } from '../store/taskStore';

export const AddTaskForm: React.FC = () => {
  const { addTask } = useTaskStore();
  // Основные поля
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Task');
  const [status, setStatus] = useState<Status>('Backlog');
  const [priority, setPriority] = useState<Priority>('Medium');

  // Сроки
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Планирование
  const [estimate, setEstimate] = useState('');

  // Классификация
  const [labels, setLabels] = useState('');

  // Контекст выполнения
  const [location, setLocation] = useState<Location | ''>('');
  const [toolsRequired, setToolsRequired] = useState('');
  const [environment, setEnvironment] = useState<Environment | ''>('');
  const [connectivity, setConnectivity] = useState<Connectivity | ''>('');
  const [executionMode, setExecutionMode] = useState<ExecutionMode | ''>('');

  // Рутинность
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('');
  const [recurrenceIntervalHours, setRecurrenceIntervalHours] = useState('');
  const [recurrenceCount, setRecurrenceCount] = useState('');
  const [routineType, setRoutineType] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Введите заголовок задачи');
      return;
    }

    try {
      // Создаем задачу на сервере
      const createdTask = await taskAPI.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        status,
        priority,
        due_date: dueDate || undefined,
        start_date: startDate || undefined,
        scheduled_time: scheduledTime || undefined,
        estimate: estimate || undefined,
        labels: labels ? labels.split(',').map(l => l.trim()) : undefined,
        location: location || undefined,
        tools_required: toolsRequired ? toolsRequired.split(',').map(t => t.trim()) : undefined,
        environment: environment || undefined,
        connectivity: connectivity || undefined,
        execution_mode: executionMode || undefined,
        is_repeatable: isRepeatable,
        recurrence_rule: recurrenceRule || undefined,
        recurrence_interval_hours: recurrenceIntervalHours ? parseInt(recurrenceIntervalHours) : undefined,
        recurrence_count: recurrenceCount ? parseInt(recurrenceCount) : undefined,
        routine_type: routineType || undefined,
      });

      // ✅ Оптимистичное обновление - сразу добавляем в store
      console.log('✨ Оптимистичное обновление: добавляем задачу в store');
      addTask(createdTask);

      // Очистка формы
      resetForm();
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      alert('Не удалось создать задачу');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('Task');
    setStatus('Backlog');
    setPriority('Medium');
    setDueDate('');
    setStartDate('');
    setScheduledTime('');
    setEstimate('');
    setLabels('');
    setLocation('');
    setToolsRequired('');
    setEnvironment('');
    setConnectivity('');
    setExecutionMode('');
    setIsRepeatable(false);
    setRecurrenceRule('');
    setRecurrenceIntervalHours('');
    setRecurrenceCount('');
    setRoutineType('');
    setIsOpen(false);
    setShowAdvanced(false);
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

      {/* Основная секция */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Основная информация</h4>

        <div style={styles.formGroup}>
          <label style={styles.label}>Заголовок: *</label>
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
          <label style={styles.label}>Описание:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            placeholder="Дополнительные детали..."
          />
        </div>

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
      </div>

      {/* Кнопка для показа расширенных полей */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={styles.advancedToggle}
      >
        {showAdvanced ? '▼ Скрыть дополнительные поля' : '▶ Показать дополнительные поля'}
      </button>

      {/* Дополнительные поля */}
      {showAdvanced && (
        <>
          {/* Сроки */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Сроки и планирование</h4>
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
          </div>

          {/* Контекст выполнения */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Контекст выполнения</h4>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Место:</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as Location | '')}
                  style={styles.select}
                >
                  <option value="">-</option>
                  <option value="Дом">🏠 Дом</option>
                  <option value="Работа">🏢 Работа</option>
                  <option value="Любое">🌍 Любое</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Окружение:</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as Environment | '')}
                  style={styles.select}
                >
                  <option value="">-</option>
                  <option value="Тишина">🤫 Тишина</option>
                  <option value="Фон">🎵 Фон</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Сеть:</label>
                <select
                  value={connectivity}
                  onChange={(e) => setConnectivity(e.target.value as Connectivity | '')}
                  style={styles.select}
                >
                  <option value="">-</option>
                  <option value="Online">🌐 Online</option>
                  <option value="Offline">📴 Offline</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Режим:</label>
                <select
                  value={executionMode}
                  onChange={(e) => setExecutionMode(e.target.value as ExecutionMode | '')}
                  style={styles.select}
                >
                  <option value="">-</option>
                  <option value="Solo">👤 Solo</option>
                  <option value="Async">📨 Async</option>
                  <option value="Sync">👥 Sync</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Инструменты (через запятую):</label>
              <input
                type="text"
                value={toolsRequired}
                onChange={(e) => setToolsRequired(e.target.value)}
                style={styles.input}
                placeholder="IDE, ноутбук, кухня"
              />
            </div>
          </div>

          {/* Классификация */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Классификация</h4>
            <div style={styles.formGroup}>
              <label style={styles.label}>Теги (через запятую):</label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                style={styles.input}
                placeholder="frontend, важное, срочно"
              />
            </div>
          </div>

          {/* Рутинность */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Повторяемость</h4>
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isRepeatable}
                  onChange={(e) => setIsRepeatable(e.target.checked)}
                />
                <span style={{ marginLeft: '8px' }}>Повторяемая задача</span>
              </label>
            </div>
            {isRepeatable && (
              <>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Интервал (часы): *</label>
                    <input
                      type="number"
                      value={recurrenceIntervalHours}
                      onChange={(e) => setRecurrenceIntervalHours(e.target.value)}
                      style={styles.input}
                      placeholder="3"
                      min="1"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Количество раз: *</label>
                    <input
                      type="number"
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(e.target.value)}
                      style={styles.input}
                      placeholder="5"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Правило повторения:</label>
                    <input
                      type="text"
                      value={recurrenceRule}
                      onChange={(e) => setRecurrenceRule(e.target.value)}
                      style={styles.input}
                      placeholder="Daily, Weekly, Monthly"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Тип рутины:</label>
                    <input
                      type="text"
                      value={routineType}
                      onChange={(e) => setRoutineType(e.target.value)}
                      style={styles.input}
                      placeholder="Routine, Ad-hoc"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Кнопки */}
      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.submitButton}>
          ✅ Создать
        </button>
        <button type="button" onClick={resetForm} style={styles.cancelButton}>
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
  } as React.CSSProperties,
  form: {
    backgroundColor: '#f8f9fa',
    border: '2px solid #007bff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  } as React.CSSProperties,
  formTitle: {
    margin: '0 0 20px 0',
    color: '#007bff',
  } as React.CSSProperties,
  section: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #dee2e6',
  } as React.CSSProperties,
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '8px',
  } as React.CSSProperties,
  formGroup: {
    marginBottom: '12px',
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
    fontSize: '13px',
  } as React.CSSProperties,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    cursor: 'pointer',
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
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  advancedToggle: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '15px',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '15px',
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
};
