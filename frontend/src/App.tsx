/**
 * Главный компонент приложения
 */

import React from 'react';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { isConnected } = useWebSocket();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎤 Todo Voice</h1>
        <div style={styles.status}>
          <span style={{...styles.statusDot, backgroundColor: isConnected ? '#28a745' : '#dc3545'}} />
          <span style={styles.statusText}>
            {isConnected ? 'Подключено' : 'Отключено'}
          </span>
        </div>
      </header>

      <main style={styles.main}>
        <AddTaskForm />
        <TaskList />
      </main>

      <footer style={styles.footer}>
        <p>💡 Совет: используйте голосовые команды для управления задачами</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '14px',
    color: '#666',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#666',
    fontSize: '14px',
  },
};

export default App;
