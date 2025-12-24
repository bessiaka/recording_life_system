/**
 * Карточка Task v1 (Intent - намерение)
 */
import React, { useState } from 'react';
import { Task } from '../types/task';
import { taskAPI } from '../api/tasks';
import { useTaskStore } from '../store/taskStore';
import { AddExecutionForm } from './AddExecutionForm';
import { ExecutionList } from './ExecutionList';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { setError } = useTaskStore();
  const [showExecutionForm, setShowExecutionForm] = useState(false);
  const [showExecutions, setShowExecutions] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Удалить намерение?')) return;

    try {
      await taskAPI.deleteTask(task.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка удаления');
    }
  };

  const priorityColor = {
    High: '#dc3545',
    Medium: '#ffc107',
    Low: '#28a745',
  }[task.priority] || '#6c757d';

  const statusBadge = {
    Backlog: { bg: '#6c757d', text: 'Backlog' },
    Active: { bg: '#007bff', text: 'Active' },
    Done: { bg: '#28a745', text: 'Done' },
    Archived: { bg: '#343a40', text: 'Archived' },
  }[task.status] || { bg: '#6c757d', text: task.status };

  return (
    <>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={{ ...styles.priorityBadge, backgroundColor: priorityColor }}>
              {task.priority}
            </span>
            <span style={{ ...styles.statusBadge, backgroundColor: statusBadge.bg }}>
              {statusBadge.text}
            </span>
            <span style={styles.type}>{task.type}</span>
          </div>
          <button onClick={handleDelete} style={styles.deleteButton}>
            Удалить
          </button>
        </div>

        <h3 style={styles.title}>{task.title}</h3>
        {task.description && <p style={styles.description}>{task.description}</p>}

        {task.due_date && (
          <div style={styles.meta}>
            Дедлайн: {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}

        {task.context && (
          <div style={styles.context}>
            {task.context.location && <span>📍 {task.context.location}</span>}
            {task.context.connectivity && <span>🌐 {task.context.connectivity}</span>}
            {task.context.tools_required && task.context.tools_required.length > 0 && (
              <span>🛠️ {task.context.tools_required.join(', ')}</span>
            )}
          </div>
        )}

        {task.recurrence?.is_repeatable && (
          <div style={styles.recurrence}>
            🔄 {task.recurrence.routine_type}
            {task.recurrence.recurrence_rule && ` • ${task.recurrence.recurrence_rule}`}
          </div>
        )}

        <div style={styles.actions}>
          <button onClick={() => setShowExecutionForm(true)} style={styles.actionButton}>
            ✅ Зафиксировать факт
          </button>
          <button onClick={() => setShowExecutions(!showExecutions)} style={styles.actionButton}>
            {showExecutions ? '▼ Скрыть историю' : '▶ Показать историю'}
          </button>
        </div>

        {showExecutions && <ExecutionList taskId={task.id} />}
      </div>

      {showExecutionForm && (
        <AddExecutionForm
          taskId={task.id}
          taskTitle={task.title}
          onClose={() => setShowExecutionForm(false)}
        />
      )}
    </>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '16px',
    marginBottom: '12px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  headerLeft: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  priorityBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
  },
  type: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: 500,
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
  },
  description: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
  },
  meta: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
  },
  context: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  recurrence: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 500,
  },
};
