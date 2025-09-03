import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useFitnessStore } from "../store/fitnessStore";
import { useFinanceStore } from "../store/financeStore";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import useDayTasks, { formatDateUTC } from '../lib/useDayTasks';
import { useGoalsStore } from '../store/goalsStore';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklySummary = () => {
  const {
    userInfo,
    getBMICategory,
    getCalorieBalance,
    getDailyProgress,
    weeklyLogs,
    fetchWeeklyLogs
  } = useFitnessStore();
  // Tooltip state for goals chart dots
  const [hoveredDot, setHoveredDot] = useState(null);
  const {
    transactions,
    fetchTransactions,
    monthlyBudget
  } = useFinanceStore();
  const { user } = useAuthStore();
  const { goals, fetchGoals, getGoalsByStatus, getGoalStats } = useGoalsStore();
  const bmiInfo = userInfo?.bmi ? getBMICategory(userInfo.bmi) : null;
  const calorieBalance = getCalorieBalance();
  const dailyProgress = getDailyProgress();

  // --- Weekly Date Range (Sunday to Saturday, UTC) ---
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date();
  const utcDayOfWeek = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
  const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - utcDayOfWeek));
  const weekEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - utcDayOfWeek + 6, 23, 59, 59, 999));

  useEffect(() => {
    fetchGoals();
    fetchWeeklyLogs();
    fetchTransactions();
  }, [fetchGoals, fetchWeeklyLogs, fetchTransactions]);

  // --- Weekly Finances Aggregation ---
  const weekTransactions = (transactions || []).filter(tx => {
  const txDate = new Date(tx.date);
  return txDate >= weekStart && txDate <= weekEnd;
  });
  const totalSpent = weekTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const totalSaved = weekTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  // Daily breakdown (Sunday to Saturday)
  const dailySpent = Array(7).fill(0);
  const dailySaved = Array(7).fill(0);
  weekTransactions.forEach(tx => {
    const txDate = new Date(tx.date);
    // Use UTC day index for consistency
    const idx = (txDate.getUTCDay() - weekStart.getUTCDay() + 7) % 7;
    if (tx.type === 'expense') dailySpent[idx] += tx.amount;
    if (tx.type === 'income') dailySaved[idx] += tx.amount;
  });
  // Recent transactions (last 3 for this week)
  const recentWeekTx = weekTransactions.slice(-3).reverse();

  // Use backend dayTasks for completed fitness tasks per day
  const { dayTasks } = useDayTasks();
  // Calculate dailyTaskCounts: count unique completed fitness tasks (workout and meal) per day
  const dailyTaskCounts = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(weekStart);
  d.setUTCDate(weekStart.getUTCDate() + i);
  const dateStr = formatDateUTC(d);
  const completed = dayTasks[dateStr]?.completed || [];
  // Count all completed workouts and meals for the day
  return completed.filter(t => t.type === 'workout' || t.type === 'meal').length;
  });
  // Calculate dailyCalories: sum calories for completed meal plans only
  const dailyCalories = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    const dateStr = formatDateUTC(d);
    const completed = dayTasks[dateStr]?.completed || [];
    return completed
      .filter(t => t.type === 'meal' && t.calories)
      .reduce((sum, t) => sum + t.calories, 0);
  });

  // For bar chart: y-axis is max number of completed tasks in a day (min 1 for visibility)
  // Each bar's height is directly proportional to its count, visually independent
  const pixelsPerTask = 30; // 30px per completed task
  const maxBarHeight = 120; // cap bar height for very high counts
  const barHeights = dailyTaskCounts.map(count => Math.min(count * pixelsPerTask, maxBarHeight));

  // For line chart: calories (max 2200, 2000, 1800)
  const maxCal = 2200;
  const minCal = 1800;
  const calRange = maxCal - minCal;
  // Move the line chart slightly lower (set Y offset to -160)
  const calY = dailyCalories.map(cal => -160 - Math.round(((cal - minCal) / calRange) * 60));

  // Prepare Chart.js data for calories chart (same style as Dashboard)
  const weeklyCalorieChartData = React.useMemo(() => ({
    labels: weekDays,
    datasets: [
      {
        label: 'Calorie Intake',
        data: dailyCalories,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Target',
        data: dailyCalories.map(() => userInfo?.caloriesIntake || 2000),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  }), [weekDays, dailyCalories, userInfo?.caloriesIntake]);

  // Prepare Chart.js data for workout completion bar chart
  const weeklyWorkoutChartData = React.useMemo(() => ({
    labels: weekDays,
    datasets: [
      {
        label: 'Completed Tasks',
        data: dailyTaskCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  }), [weekDays, dailyTaskCounts]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const barChartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }), []);
  
  // --- Goals Aggregation ---
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    return formatDateUTC(d);
  });
  // Filter goals for this week
  const weeklyGoals = goals.filter(goal => weekDates.includes(goal.date));
  const completedGoals = weeklyGoals.filter(goal => goal.completed);
  const ongoingGoals = weeklyGoals.filter(goal => !goal.completed);
  const totalGoals = weeklyGoals.length;
  const completedCount = completedGoals.length;
  // Progress percentage
  const progressPercent = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;

  // Daily completion chart
  const dailyGoalCounts = weekDates.map(date => weeklyGoals.filter(goal => goal.date === date && goal.completed).length);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-base-100">
        <Navbar />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8 text-base-content">Here's your weekly summary!</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full min-w-0">
            {/* Fitness Box */}
            <div className="card bg-base-200 shadow-xl rounded-lg relative flex-1 min-w-0 w-full max-w-full overflow-x-auto p-8 break-words">
              <div className="card-body pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">Fitness Summary:</h2>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                      <span className="text-2xl">&#8942;</span>
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                      <li><Link to="/trends">Go to Fitness Page</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Days Worked Out (Bar Chart) */}
                  <div>
                    <div className="font-semibold mb-2">Total Completed Meals/Workouts:</div>
                    <div className="h-48 w-full">
                      {dailyTaskCounts.every(count => count === 0) ? (
                        <div className="text-base-content/60 text-center mt-8">No completed fitness tasks this week.</div>
                      ) : (
                        <Bar data={weeklyWorkoutChartData} options={barChartOptions} />
                      )}
                    </div>
                  </div>
                  {/* Calories (Chart.js Line Chart) - same style as Dashboard */}
                  <div>
                    <div className="font-semibold mb-2">Calories:</div>
                    <div className="h-48 w-full">
                      <Line data={weeklyCalorieChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
                {/* Exercises Done (Mini Bar Charts) */}
                <div className="mt-8">
                  <div className="font-semibold mb-2">Workouts & Meal Plans This Week:</div>
                  <div className="grid grid-cols-4 gap-2 items-center mb-2">
                    <span className="text-xs font-semibold text-base-content/70">Name</span>
                    <span className="text-xs font-semibold text-base-content/70">Type</span>
                    <span className="text-xs font-semibold text-base-content/70 text-center">Pending</span>
                    <span className="text-xs font-semibold text-base-content/70 text-center">Completed</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(() => {
                      // Gather all items for the week
                      const weekDates = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(weekStart);
                        d.setUTCDate(weekStart.getUTCDate() + i);
                        return formatDateUTC(d);
                      });
                      const allPending = [];
                      const allCompleted = [];
                      weekDates.forEach(dateStr => {
                        const day = dayTasks[dateStr] || { pending: [], completed: [] };
                        allPending.push(...day.pending);
                        allCompleted.push(...day.completed);
                      });
                      // Get all unique items by id+type
                      const allItemsMap = new Map();
                      [...allPending, ...allCompleted].forEach(item => {
                        allItemsMap.set(`${item.type}_${item.id}`, item);
                      });
                      // For each unique item, count pending and completed
                      return Array.from(allItemsMap.values()).map(item => {
                        const pendingCount = allPending.filter(i => i.id === item.id && i.type === item.type).length;
                        const completedCount = allCompleted.filter(i => i.id === item.id && i.type === item.type).length;
                        const maxCount = Math.max(pendingCount, completedCount, 1);
                        const barMaxWidth = 100;
                        return (
                          <div key={`${item.type}_${item.id}`} className="grid grid-cols-4 gap-2 items-center">
                            <div className="w-32 truncate text-xs font-semibold text-base-content/80">{item.name}</div>
                            <div className="w-14 text-xs text-base-content/60">{item.type}</div>
                            <div className="flex justify-center">
                              <div style={{ width: `${(pendingCount / maxCount) * barMaxWidth}px`, height: 18, background: '#fbbf24', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#222', minWidth: 24 }} title={`Pending: ${pendingCount}`}>{pendingCount > 0 ? pendingCount : ''}</div>
                            </div>
                            <div className="flex justify-center">
                              <div style={{ width: `${(completedCount / maxCount) * barMaxWidth}px`, height: 18, background: '#22c55e', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff', minWidth: 24 }} title={`Completed: ${completedCount}`}>{completedCount > 0 ? completedCount : ''}</div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
            {/* Finances Box */}
            <div className="card bg-base-200 shadow-xl rounded-lg relative flex-1 min-w-0 w-full max-w-full overflow-x-auto p-8 break-words">
              <div className="card-body pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="card-title text-2xl">Finances</h2>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                      <span className="text-2xl">&#8942;</span>
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                      <li><Link to="/expenses">Go to Finances Page</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-2">Targets:</div>
                    <div className="mb-2">Earned (This Week):</div>
                    <div className="w-full h-4 bg-base-300 rounded-full mb-2">
                      <div
                        className="h-4 relative group cursor-pointer"
                        style={{ width: `${Math.min(100, totalSaved / (monthlyBudget || 1) * 100)}%`, backgroundColor: '#ffe066', borderRadius: '9999px' }}
                      >
                        <span
                          className="absolute left-1/2 -translate-x-1/2 -top-8 bg-base-200 text-base-content text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                        >
                          {totalSaved.toLocaleString()} BDT/-
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full flex mb-4 flex-wrap text-xs md:text-sm" style={{ height: '1.5em' }}>
                      <span className="absolute left-0 whitespace-nowrap" style={{ minWidth: '40px' }}>0 BDT/-</span>
                      <span className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap" style={{ minWidth: '40px' }}>{(monthlyBudget/2).toLocaleString()} BDT/-</span>
                      <span className="absolute right-0 text-right whitespace-nowrap" style={{ minWidth: '40px' }}>{monthlyBudget.toLocaleString()} BDT/-</span>
                    </div>
                    <div className="mb-2">Spent:</div>
                    <div className="w-full h-4 bg-base-300 rounded-full mb-2">
                      <div
                        className="h-4 relative group cursor-pointer"
                        style={{ width: `${Math.min(100, totalSpent / (monthlyBudget || 1) * 100)}%`, backgroundColor: '#f87171', borderRadius: '9999px' }}
                      >
                        <span
                          className="absolute left-1/2 -translate-x-1/2 -top-8 bg-base-200 text-base-content text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                        >
                          {totalSpent.toLocaleString()} BDT/-
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full flex mb-4 flex-wrap text-xs md:text-sm" style={{ height: '1.5em' }}>
                      <span className="absolute left-0 whitespace-nowrap" style={{ minWidth: '40px' }}>0 BDT/-</span>
                      <span className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap" style={{ minWidth: '40px' }}>{(monthlyBudget/2).toLocaleString()} BDT/-</span>
                      <span className="absolute right-0 text-right whitespace-nowrap" style={{ minWidth: '40px' }}>{monthlyBudget.toLocaleString()} BDT/-</span>
                    </div>
                    <div className="font-semibold mb-2">Recent Transactions:</div>
                    <div className="flex flex-col gap-2">
                      {recentWeekTx.length === 0 && <div className="text-xs text-base-content/60">No transactions this week.</div>}
                      {recentWeekTx.map(tx => (
                        <div
                          key={tx._id}
                          className="rounded-lg px-4 py-2 grid grid-cols-3 items-center relative group"
                          style={{ backgroundColor: '#ffe066', color: '#222' }}
                        >
                          <span className="col-span-1 truncate">{tx.category || tx.description || tx.type}</span>
                          <span className="col-span-1 text-center">{new Date(tx.date).toLocaleDateString()}</span>
                          <span className="col-span-1 text-right">{tx.type === 'expense' ? '-' : '+'}{tx.amount} BDT/-</span>
                          {/* Tooltip for more details */}
                          <span
                            className="absolute left-1/2 -translate-x-1/2 -top-12 bg-base-200 text-base-content text-xs px-3 py-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                            style={{ minWidth: '180px' }}
                          >
                            <div><span className="font-bold">Category:</span> {tx.category || 'N/A'}</div>
                            <div><span className="font-bold">Description:</span> {tx.description || 'No description'}</div>
                            <div><span className="font-bold">ID:</span> {tx._id}</div>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-end gap-4 h-28 w-full max-w-[320px] mx-auto">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const earned = dailySaved[i];
                          const spent = dailySpent[i];
                          const max = Math.max(...dailySaved, ...dailySpent, 1);
                          const barHeight = val => Math.round((val / max) * 70) + 18;
                          return (
                            <div key={i} className="flex flex-col items-center justify-end w-10 relative">
                              {/* Earned bar with tooltip on hover */}
                              <div
                                className="group"
                                style={{ height: barHeight(earned), width: 20, background: '#22c55e', borderRadius: '6px 6px 0 0', marginBottom: 2, position: 'relative' }}
                              >
                                {earned > 0 && (
                                  <span
                                    className="absolute left-1/2 -translate-x-1/2 -top-8 bg-base-200 text-base-content text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                                  >
                                    Earned: {earned.toLocaleString()} BDT/-
                                  </span>
                                )}
                              </div>
                              {/* Spent bar with tooltip on hover */}
                              <div
                                className="group"
                                style={{ height: barHeight(spent), width: 20, background: '#f87171', borderRadius: '0 0 6px 6px', position: 'relative' }}
                              >
                                {spent > 0 && (
                                  <span
                                    className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-base-200 text-base-content text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                                  >
                                    Spent: {spent.toLocaleString()} BDT/-
                                  </span>
                                )}
                              </div>
                              {/* Net change label */}
                              <span style={{ fontSize: 11, marginTop: 2, color: earned - spent >= 0 ? '#22c55e' : '#f87171', fontWeight: 600 }}>
                                {earned - spent >= 0 ? '+' : ''}{earned - spent}
                              </span>
                              {/* Day label */}
                              <span style={{ fontSize: 13, marginTop: 2 }}>{['S','M','T','W','T','F','S'][i]}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="font-semibold mt-4 mb-2 text-center">Daily Earned vs. Spent</div>
                    </div>
                    <div className="mt-8">
                      <div className="font-semibold mb-2">Budget:</div>
                      <div className="bg-base-300 rounded-lg shadow px-6 py-4 text-center text-3xl font-bold">
                        {totalSpent?.toLocaleString()} <span className="text-base font-normal">/ {monthlyBudget?.toLocaleString()} BDT/-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-xl min-h-[200px] relative md:col-span-2 lg:col-span-3 mt-6 min-w-0 overflow-x-auto">
              <div className="card-body pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="card-title text-2xl">Goals</h2>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                      <span className="text-2xl">&#8942;</span>
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                      <li><Link to="/goals">Go to Goals Page</Link></li>
                    </ul>
                  </div>
                </div>
                {/* Redesigned Goals Box - Placeholder data, backend ready */}
                <div className="font-semibold mb-2">Tasks Completed:</div>
                <div className="mb-2">This Week:</div>
                <div className="flex items-center mb-2">
                  <div className="flex items-center w-full">
                    <div className="relative" style={{ width: '60%' }}>
                      <div className="w-full h-3 bg-base-300 rounded-full">
                        <div className="h-3" style={{ width: `${progressPercent}%`, backgroundColor: '#60a5fa', borderRadius: '9999px' }}></div>
                      </div>
                      <div className="absolute left-0 top-5 text-xs">0%</div>
                      <div className="absolute left-1/2 top-5 transform -translate-x-1/2 text-xs">50%</div>
                      <div className="absolute right-0 top-5 text-xs">100%</div>
                    </div>
                    <span className="ml-4 text-base font-semibold">{completedCount} / {totalGoals} tasks</span>
                  </div>
                </div>
                {/* Dot Graph for daily tasks - fixed alignment and y-axis bar */}
                <div className="mt-0 mb-0 flex justify-center">
                  <div style={{ position: 'relative', width: 600, height: 200 }}>
                    <svg width="600" height="200" viewBox="0 0 520 200">
                      {/* Y axis bar */}
                      <line x1="60" y1="30" x2="60" y2="170" stroke="#222" strokeWidth="2" />
                      {/* X axis */}
                      <line x1="60" y1="170" x2="500" y2="170" stroke="#222" />
                      {/* Dots for each day - stacked from bottom, with tooltips */}
                      {weekDates.flatMap((date, i) => {
                        const x = 100 + i * 60;
                        const dayGoals = weeklyGoals.filter(goal => goal.date === date);
                        const baseY = 170 - 18;
                        return dayGoals.map((goal, j) => {
                          const isCompleted = goal.completed;
                          const color = isCompleted ? '#60a5fa' : '#bbb';
                          const y = baseY - j * 30;
                          // Use goal.id if available, else fallback to title+index for key
                          const key = goal.id ? `g-${date}-${goal.id}` : `g-${date}-${goal.title}-${j}`;
                          return (
                            <circle
                              key={key}
                              cx={x}
                              cy={y}
                              r="7"
                              fill={color}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setHoveredDot({ x, y, title: goal.title, status: isCompleted ? 'Completed' : 'Pending' })}
                              onMouseLeave={() => setHoveredDot(null)}
                            />
                          );
                        });
                      })}
                      {/* Day labels - spaced under dots */}
                      {weekDays.map((d, i) => (
                        <text key={`day-label-${i}`} x={100 + i * 60} y="190" textAnchor="middle" fontSize="16">{d}</text>
                      ))}
                    </svg>
                    {hoveredDot && (
                      <div
                        style={{
                          position: 'absolute',
                          left: hoveredDot.x - 60,
                          top: hoveredDot.y - 40,
                          background: '#fff',
                          color: '#222',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontSize: 13,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 20,
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {hoveredDot.title} <span style={{ color: hoveredDot.status === 'Completed' ? '#22c55e' : '#bbb', fontWeight: 600 }}>({hoveredDot.status})</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* On-going Tasks */}
                  <div>
                    <div className="font-semibold mb-2">On-going Tasks:</div>
                    <div className="flex flex-col gap-2">
                      {ongoingGoals.length === 0 && <div className="text-xs text-base-content/60">No ongoing tasks this week.</div>}
                      {ongoingGoals.map(goal => (
                        <div key={goal._id} className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                          <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>{goal.title}</span>
                          <span>{goal.progress || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Completed Tasks */}
                  <div>
                    <div className="font-semibold mb-2">Completed Tasks:</div>
                    <div className="flex flex-col gap-2">
                      {completedGoals.length === 0 && <div className="text-xs text-base-content/60">No completed tasks this week.</div>}
                      {completedGoals.map(goal => (
                        <div key={goal._id} className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                          <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>{goal.title}</span>
                          <span className="ml-2"><span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">&#10003;</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WeeklySummary;
