/**
 * Форма фиксации факта выполнения (Execution v1)
 */
import React, { useState } from 'react';
import { ExecutionCreate } from '../types/task';
import { executionAPI } from '../api/tasks';
import { useTaskStore } from '../store/taskStore';

interface AddExecutionFormProps {
  taskId: number;
  taskTitle: string;
  onClose: () => void;
}

export const AddExecutionForm: React.FC<AddExecutionFormProps> = ({ taskId, taskTitle, onClose }) => {
  const { setError } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<'completed' | 'failed' | 'skipped' | 'partial'>('completed');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [note, setNote] = useState('');
  const [payloadJson, setPayloadJson] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      let payload: Record<string, any> | undefined;
      if (payloadJson.trim()) {
        try {
          payload = JSON.parse(payloadJson);
        } catch {
          setError('Неверный JSON в payload');
          setIsLoading(false);
          return;
        }
      }

      // Вычисляем duration если заданы оба времени
      let duration: number | undefined;
      if (startedAt && endedAt) {
        const start = new Date(startedAt);
        const end = new Date(endedAt);
        duration = (end.getTime() - start.getTime()) / 1000; // в секундах
      }

      const executionData: ExecutionCreate = {
        task_id: taskId,
        status,
        started_at: startedAt || undefined,
        ended_at: endedAt || undefined,
        duration,
        note: note.trim() || undefined,
        payload,
        recorded_by: 'manual',
      };

      await executionAPI.createExecution(executionData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка фиксации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Зафиксировать факт выполнения</h2>
        <p style={styles.taskInfo}>Задача: <strong>{taskTitle}</strong></p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Результат *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={styles.select}>
              <option value="completed">Completed (выполнено)</option>
              <option value="failed">Failed (провалено)</option>
              <option value="skipped">Skipped (пропущено)</option>
              <option value="partial">Partial (частично)</option>
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Начало</label>
              <input
                type="datetime-local"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Конец</label>
              <input
                type="datetime-local"
                value={endedAt}
                onChange={(e) => setEndedAt(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Заметка</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.textarea}
              placeholder="Что произошло?"
              rows={3}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Данные (JSON payload, опционально)</label>
            <textarea
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
              style={styles.textarea}
              placeholder='{"key": "value"}'
              rows={3}
            />
          </div>

          <div style={styles.buttons}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" disabled={isLoading} style={styles.submitButton}>
              {isLoading ? 'Сохранение...' : 'Зафиксировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  taskInfo: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '14px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
