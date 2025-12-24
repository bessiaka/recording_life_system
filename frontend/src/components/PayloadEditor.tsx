/**
 * Конструктор payload - динамическое добавление полей
 */
import React, { useState } from 'react';

interface PayloadField {
  id: string;
  key: string;
  value: string;
  isArray: boolean;
}

interface PayloadEditorProps {
  value: Record<string, any>;
  onChange: (payload: Record<string, any>) => void;
}

export const PayloadEditor: React.FC<PayloadEditorProps> = ({ value, onChange }) => {
  const [fields, setFields] = useState<PayloadField[]>(() => {
    // Инициализация из value
    if (!value || Object.keys(value).length === 0) {
      return [];
    }

    return Object.entries(value).map(([key, val]) => ({
      id: Math.random().toString(36).substr(2, 9),
      key,
      value: Array.isArray(val) ? val.join(', ') : String(val),
      isArray: Array.isArray(val),
    }));
  });

  const addField = () => {
    const newField: PayloadField = {
      id: Math.random().toString(36).substr(2, 9),
      key: '',
      value: '',
      isArray: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    const updated = fields.filter(f => f.id !== id);
    setFields(updated);
    updatePayload(updated);
  };

  const updateField = (id: string, updates: Partial<PayloadField>) => {
    const updated = fields.map(f => f.id === id ? { ...f, ...updates } : f);
    setFields(updated);
    updatePayload(updated);
  };

  const updatePayload = (currentFields: PayloadField[]) => {
    const payload: Record<string, any> = {};

    currentFields.forEach(field => {
      if (!field.key.trim()) return;

      if (field.isArray) {
        // Массив - разделяем по запятой
        payload[field.key] = field.value
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0);
      } else {
        // Единичное значение
        payload[field.key] = field.value;
      }
    });

    onChange(payload);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>Данные (Payload)</label>
        <button type="button" onClick={addField} style={styles.addButton}>
          + Добавить поле
        </button>
      </div>

      {fields.length === 0 ? (
        <div style={styles.empty}>Нет полей. Нажмите "+ Добавить поле"</div>
      ) : (
        <div style={styles.fields}>
          {fields.map((field) => (
            <div key={field.id} style={styles.field}>
              <input
                type="text"
                placeholder="Название поля"
                value={field.key}
                onChange={(e) => updateField(field.id, { key: e.target.value })}
                style={styles.keyInput}
              />

              <input
                type="text"
                placeholder={field.isArray ? 'Значения (через запятую)' : 'Значение'}
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                style={styles.valueInput}
              />

              <label style={styles.arrayToggle}>
                <input
                  type="checkbox"
                  checked={field.isArray}
                  onChange={(e) => updateField(field.id, { isArray: e.target.checked })}
                />
                <span style={styles.arrayLabel}>Массив</span>
              </label>

              <button
                type="button"
                onClick={() => removeField(field.id)}
                style={styles.removeButton}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Превью JSON */}
      {fields.length > 0 && (
        <details style={styles.preview}>
          <summary style={styles.previewSummary}>Превью JSON</summary>
          <pre style={styles.previewContent}>
            {JSON.stringify(
              fields.reduce((acc, f) => {
                if (!f.key.trim()) return acc;
                if (f.isArray) {
                  acc[f.key] = f.value.split(',').map(v => v.trim()).filter(v => v);
                } else {
                  acc[f.key] = f.value;
                }
                return acc;
              }, {} as Record<string, any>),
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
  },
  addButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  empty: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#6c757d',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  field: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  keyInput: {
    flex: '0 0 150px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
  },
  valueInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
  },
  arrayToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  arrayLabel: {
    color: '#6c757d',
  },
  removeButton: {
    padding: '6px 10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  preview: {
    marginTop: '12px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  previewSummary: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#495057',
    cursor: 'pointer',
  },
  previewContent: {
    fontSize: '11px',
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    overflow: 'auto',
  },
};
