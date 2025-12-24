/**
 * Recording Life System v1 - Intent (Task) + Fact (Execution)
 */
import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { useTaskStore } from './store/taskStore';

function App() {
  const { isConnected } = useWebSocket();
  const { error } = useTaskStore();

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Recording Life System v1</h1>
        <div style={styles.status}>
          <span style={{ ...styles.statusDot, backgroundColor: isConnected ? '#28a745' : '#dc3545' }} />
          <span style={styles.statusText}>
            {isConnected ? 'Подключено' : 'Отключено'}
          </span>
        </div>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        <AddTaskForm />
        <TaskList />
      </main>

      <footer style={styles.footer}>
        <p>Intent (намерение) → Fact (фиксация) • Минимальная модель жизни</p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#333',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '14px',
    color: '#666',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '20px',
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
  footer: {
    backgroundColor: '#fff',
    padding: '16px',
    textAlign: 'center' as const,
    borderTop: '1px solid #dee2e6',
    color: '#6c757d',
    fontSize: '14px',
  },
};

export default App;
