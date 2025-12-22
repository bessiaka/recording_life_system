/**
 * Компонент временной ленты задач
 * Отображает задачи, запланированные на день, с временными метками
 */

import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

export const TaskTimeline: React.FC = () => {
  const { tasks } = useTaskStore();

  // Получаем сегодняшнюю дату в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Фильтруем и сортируем задачи
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    // Задачи на сегодня
    const todayTasks = tasks.filter(task => {
      // Показываем задачи с датой начала сегодня или без даты, но со временем
      return task.start_date === today || (task.scheduled_time && !task.start_date);
    });

    // Разделяем на задачи с временем и без времени
    const withTime: Task[] = [];
    const withoutTime: Task[] = [];

    todayTasks.forEach(task => {
      if (task.scheduled_time) {
        withTime.push(task);
      } else {
        withoutTime.push(task);
      }
    });

    // Сортируем задачи с временем по возрастанию
    withTime.sort((a, b) => {
      const timeA = a.scheduled_time || '00:00';
      const timeB = b.scheduled_time || '00:00';
      return timeA.localeCompare(timeB);
    });

    return {
      scheduledTasks: withTime,
      unscheduledTasks: withoutTime,
    };
  }, [tasks, today]);

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  if (scheduledTasks.length === 0 && unscheduledTasks.length === 0) {
    return (
      <div style={styles.empty}>
        <p>📅 На сегодня задач не запланировано</p>
        <p style={styles.emptyHint}>Добавьте задачу с временем начала!</p>
      </div>
    );
  }

  return (
    <div style={styles.timeline}>
      <h2 style={styles.timelineTitle}>📅 Лента задач на сегодня</h2>

      {/* Задачи с временем */}
      {scheduledTasks.length > 0 && (
        <div style={styles.scheduledSection}>
          <h3 style={styles.sectionTitle}>⏰ Запланированные задачи</h3>
          <div style={styles.timelineTrack}>
            {scheduledTasks.map((task) => (
              <div key={task.id} style={styles.timelineItem}>
                <div style={styles.timeLabel}>
                  {formatTime(task.scheduled_time!)}
                </div>
                <div style={styles.timelineDot} />
                <div style={styles.taskCard}>
                  <TaskItem task={task} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Задачи без времени */}
      {unscheduledTasks.length > 0 && (
        <div style={styles.unscheduledSection}>
          <h3 style={styles.sectionTitle}>📋 Без точного времени</h3>
          <div style={styles.unscheduledList}>
            {unscheduledTasks.map((task) => (
              <div key={task.id} style={styles.unscheduledItem}>
                <TaskItem task={task} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  timeline: {
    marginTop: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  timelineTitle: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
  } as React.CSSProperties,
  scheduledSection: {
    marginBottom: '30px',
  } as React.CSSProperties,
  unscheduledSection: {
    marginTop: '20px',
  } as React.CSSProperties,
  sectionTitle: {
    marginBottom: '16px',
    color: '#666',
    fontSize: '18px',
    fontWeight: '600',
  } as React.CSSProperties,
  timelineTrack: {
    position: 'relative',
    paddingLeft: '80px',
    borderLeft: '3px solid #007bff',
    marginLeft: '80px',
  } as React.CSSProperties,
  timelineItem: {
    position: 'relative',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  timeLabel: {
    position: 'absolute',
    left: '-80px',
    top: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#007bff',
    width: '60px',
    textAlign: 'right',
  } as React.CSSProperties,
  timelineDot: {
    position: 'absolute',
    left: '-11px',
    top: '12px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    border: '3px solid #fff',
    boxShadow: '0 0 0 2px #007bff',
  } as React.CSSProperties,
  taskCard: {
    flex: 1,
    marginLeft: '16px',
  } as React.CSSProperties,
  unscheduledList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,
  unscheduledItem: {
    paddingLeft: '20px',
    borderLeft: '3px solid #dee2e6',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#666',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginTop: '20px',
  } as React.CSSProperties,
  emptyHint: {
    fontSize: '14px',
    color: '#999',
  } as React.CSSProperties,
};
