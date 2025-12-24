/**
 * Список Executions для Task (история выполнений)
 */
import React, { useEffect, useState } from 'react';
import { Execution } from '../types/task';
import { executionAPI } from '../api/tasks';

interface ExecutionListProps {
  taskId: number;
}

export const ExecutionList: React.FC<ExecutionListProps> = ({ taskId }) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExecutions();
  }, [taskId]);

  const loadExecutions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await executionAPI.getTaskExecutions(taskId);
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={styles.message}>Загрузка истории...</div>;
  }

  if (error) {
    return <div style={styles.error}>Ошибка: {error}</div>;
  }

  if (executions.length === 0) {
    return <div style={styles.message}>История выполнений пуста</div>;
  }

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>История выполнений ({executions.length})</h4>

      {executions.map((exec) => (
        <div key={exec.id} style={styles.item}>
          <div style={styles.itemHeader}>
            <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(exec.status) }}>
              {exec.status}
            </span>
            <span style={styles.date}>
              {new Date(exec.created_at).toLocaleString('ru-RU')}
            </span>
          </div>

          {exec.note && <div style={styles.note}>{exec.note}</div>}

          <div style={styles.meta}>
            {exec.started_at && (
              <span>Начало: {new Date(exec.started_at).toLocaleString('ru-RU')}</span>
            )}
            {exec.ended_at && (
              <span>Конец: {new Date(exec.ended_at).toLocaleString('ru-RU')}</span>
            )}
            {exec.duration !== undefined && (
              <span>Длительность: {formatDuration(exec.duration)}</span>
            )}
            <span>Способ: {exec.recorded_by === 'manual' ? 'Вручную' : 'Авто'}</span>
          </div>

          {exec.payload && Object.keys(exec.payload).length > 0 && (
            <details style={styles.payload}>
              <summary style={styles.payloadSummary}>Данные (payload)</summary>
              <pre style={styles.payloadContent}>
                {JSON.stringify(exec.payload, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#28a745';
    case 'failed':
      return '#dc3545';
    case 'skipped':
      return '#6c757d';
    case 'partial':
      return '#ffc107';
    default:
      return '#6c757d';
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  }
  return `${secs}с`;
}

const styles = {
  container: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
  },
  item: {
    backgroundColor: '#fff',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
  },
  date: {
    fontSize: '12px',
    color: '#6c757d',
  },
  note: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '8px',
    lineHeight: 1.5,
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    fontSize: '12px',
    color: '#6c757d',
  },
  payload: {
    marginTop: '8px',
  },
  payloadSummary: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#495057',
    cursor: 'pointer',
  },
  payloadContent: {
    fontSize: '11px',
    backgroundColor: '#f8f9fa',
    padding: '8px',
    borderRadius: '4px',
    overflow: 'auto',
    marginTop: '4px',
  },
  message: {
    padding: '16px',
    textAlign: 'center' as const,
    color: '#6c757d',
    fontSize: '14px',
  },
  error: {
    padding: '16px',
    textAlign: 'center' as const,
    color: '#dc3545',
    fontSize: '14px',
  },
};
