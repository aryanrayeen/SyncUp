
import { useState, useEffect, useCallback } from 'react';
import api from './axios';

// Always use UTC for date keys
export function formatDateUTC(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Loads all tasks for a week (Sunday-Saturday) for the current user
async function fetchWeekTasks(weekStart, setDayTasks) {
  const tasks = {};
  const requests = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    const dateStr = formatDateUTC(d);
    requests.push(
      api.get(`/day-tasks/${dateStr}`)
        .then(res => { tasks[dateStr] = res.data || { pending: [], completed: [] }; })
        .catch(() => { tasks[dateStr] = { pending: [], completed: [] }; })
    );
  }
  await Promise.all(requests);
  setDayTasks(tasks);
}

export default function useDayTasks() {
  const [dayTasks, setDayTasks] = useState({});

  // Load current week tasks on mount
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getUTCDay();
    const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - dayOfWeek));
    fetchWeekTasks(weekStart, setDayTasks);
  }, []);

  // Add, complete, uncomplete, delete helpers (all call API)
  const saveDay = async (date, newDay) => {
    const dateStr = formatDateUTC(date);
    await api.post(`/day-tasks/${dateStr}`, newDay);
    setDayTasks(prev => ({ ...prev, [dateStr]: newDay }));
  };

  const addPending = useCallback(async (date, item) => {
    const dateStr = formatDateUTC(date);
    const prevDay = dayTasks[dateStr] || { pending: [], completed: [] };
    if (prevDay.pending.some(i => i.id === item.id) || prevDay.completed.some(i => i.id === item.id)) return;
    const newDay = {
      ...prevDay,
      pending: [...prevDay.pending, item],
    };
    await saveDay(date, newDay);
  }, [dayTasks]);

  const complete = useCallback(async (date, item) => {
    const dateStr = formatDateUTC(date);
    const prevDay = dayTasks[dateStr] || { pending: [], completed: [] };
    let completedItem = { ...item };
    // If completing a workout, attach its plan (exercises) if not present
    if (item.type === 'workout' && !item.plan) {
      try {
        // Try to fetch workout plan details from API (assume item.id is plan id)
        const res = await api.get(`/workout-plan/${item.id}`);
        if (res.data && Array.isArray(res.data.exercises)) {
          completedItem.plan = res.data.exercises;
        }
      } catch (err) {
        console.warn('Could not fetch workout plan for completed workout:', err);
      }
    }
    const newDay = {
      pending: prevDay.pending.filter(i => i.id !== item.id),
      completed: [...prevDay.completed, completedItem],
    };
    await saveDay(date, newDay);
  }, [dayTasks]);

  const uncomplete = useCallback(async (date, item) => {
    const dateStr = formatDateUTC(date);
    const prevDay = dayTasks[dateStr] || { pending: [], completed: [] };
    const newDay = {
      pending: [...prevDay.pending, item],
      completed: prevDay.completed.filter(i => i.id !== item.id),
    };
    await saveDay(date, newDay);
  }, [dayTasks]);

  const remove = useCallback(async (date, item) => {
    const dateStr = formatDateUTC(date);
    const prevDay = dayTasks[dateStr] || { pending: [], completed: [] };
    const newDay = {
      pending: prevDay.pending.filter(i => i.id !== item.id),
      completed: prevDay.completed.filter(i => i.id !== item.id),
    };
    await saveDay(date, newDay);
  }, [dayTasks]);

  return { dayTasks, setDayTasks, addPending, complete, uncomplete, remove };
}
