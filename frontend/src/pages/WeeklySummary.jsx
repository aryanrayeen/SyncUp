import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useFitnessStore } from "../store/fitnessStore";
import { useFinanceStore } from "../store/financeStore";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import useDayTasks, { formatDateUTC } from '../lib/useDayTasks';

const WeeklySummary = () => {
  const {
    userInfo,
    getBMICategory,
    getCalorieBalance,
    getDailyProgress,
    weeklyLogs,
    fetchWeeklyLogs
  } = useFitnessStore();
  const {
    transactions,
    fetchTransactions,
    monthlyBudget
  } = useFinanceStore();
  const { user } = useAuthStore();
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
    fetchWeeklyLogs();
    fetchTransactions();
  }, [fetchWeeklyLogs, fetchTransactions]);

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
                    <div className="font-semibold mb-2">Days Worked Out:</div>
                    <div className="h-48 w-full flex justify-center items-end">
                      {(() => {
                        const [hoveredBar, setHoveredBar] = React.useState(null);
                        // Helper to get completed items for a given day index
                        const getCompletedForDay = (i) => {
                          const d = new Date(weekStart);
                          d.setUTCDate(weekStart.getUTCDate() + i);
                          const dateStr = formatDateUTC(d);
                          return (dayTasks[dateStr]?.completed || []);
                        };
                        return dailyTaskCounts.every(count => count === 0) ? (
                          <div className="text-base-content/60 text-center mt-8">No completed fitness tasks this week.</div>
                        ) : (
                          <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 160, position: 'relative' }}>
                            <svg width={340} height={130} viewBox="0 0 340 130">
                              {/* Fixed Y axis lines and labels for 1–5 tasks */}
                              {[1,2,3,4,5].map(label => {
                                const yStart = 110;
                                const yEnd = 20;
                                const maxBarHeight = yStart - yEnd;
                                // Position line for each label
                                const y = yStart - ((label / 5) * maxBarHeight);
                                return (
                                  <g key={label}>
                                    <line x1="45" y1={y} x2="285" y2={y} stroke="#ccc" />
                                    <text x="18" y={y+5} fontSize="10" fontWeight="bold">{label}</text>
                                  </g>
                                );
                              })}
                              {/* Day labels */}
                              <text x="67" y="125" textAnchor="middle" fontSize="13">S</text>
                              <text x="99" y="125" textAnchor="middle" fontSize="13">M</text>
                              <text x="131" y="125" textAnchor="middle" fontSize="13">T</text>
                              <text x="163" y="125" textAnchor="middle" fontSize="13">W</text>
                              <text x="195" y="125" textAnchor="middle" fontSize="13">T</text>
                              <text x="227" y="125" textAnchor="middle" fontSize="13">F</text>
                              <text x="259" y="125" textAnchor="middle" fontSize="13">S</text>
                            </svg>
                            {/* Tooltip for hovered bar */}
                            {hoveredBar !== null && (
                              <div style={{
                                position: 'absolute',
                                left: 58 + hoveredBar * 32 - 30,
                                top: 10,
                                background: 'rgba(30,41,59,0.97)',
                                color: '#fff',
                                borderRadius: 8,
                                padding: '10px 14px',
                                minWidth: 160,
                                zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                              }}>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Completed ({weekDays[hoveredBar]})</div>
                                {getCompletedForDay(hoveredBar).length === 0 ? (
                                  <div style={{ color: '#cbd5e1' }}>No items</div>
                                ) : (
                                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                                    {getCompletedForDay(hoveredBar).map((item, idx) => (
                                      <li key={item.id || idx} style={{ fontSize: 13 }}>
                                        {item.name} <span style={{ color: '#38bdf8', fontSize: 11 }}>({item.type})</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Calories (Line Chart) - now same size as bar chart */}
                  <div>
                    <div className="font-semibold mb-2">Calories:</div>
                    <div className="h-48 w-full flex justify-center items-end">
                      <svg width={340} height={130} viewBox="0 0 340 130">
                        {/* Y axis lines */}
                        <line x1="45" y1="20" x2="285" y2="20" stroke="#ccc" />
                        <line x1="45" y1="65" x2="285" y2="65" stroke="#ccc" />
                        <line x1="45" y1="110" x2="285" y2="110" stroke="#ccc" />
                        {/* Y axis labels */}
                        <text x="18" y="25" fontSize="12">2.2k</text>
                        <text x="18" y="70" fontSize="12">2k</text>
                        <text x="18" y="115" fontSize="12">1.8k</text>
                        {/* Line for calories - dynamic */}
                        <polyline
                          points={calY.map((y, i) => `${58 + i * 32},${y}` ).join(' ')}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="3"
                        />
                        {/* Day labels */}
                        <text x="67" y="125" textAnchor="middle" fontSize="13">S</text>
                        <text x="99" y="125" textAnchor="middle" fontSize="13">M</text>
                        <text x="131" y="125" textAnchor="middle" fontSize="13">T</text>
                        <text x="163" y="125" textAnchor="middle" fontSize="13">W</text>
                        <text x="195" y="125" textAnchor="middle" fontSize="13">T</text>
                        <text x="227" y="125" textAnchor="middle" fontSize="13">F</text>
                        <text x="259" y="125" textAnchor="middle" fontSize="13">S</text>
                      </svg>
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
                  {(() => {
                    const completed = 5;
                    const total = 19;
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <div className="flex items-center w-full">
                        <div className="relative" style={{ width: '60%' }}>
                          <div className="w-full h-3 bg-base-300 rounded-full">
                            <div className="h-3" style={{ width: `${percent}%`, backgroundColor: '#60a5fa', borderRadius: '9999px' }}></div>
                          </div>
                          <div className="absolute left-0 top-5 text-xs">0%</div>
                          <div className="absolute left-1/2 top-5 transform -translate-x-1/2 text-xs">50%</div>
                          <div className="absolute right-0 top-5 text-xs">100%</div>
                        </div>
                        <span className="ml-4 text-base font-semibold">{completed} / {total} tasks</span>
                      </div>
                    );
                  })()}
                </div>
                {/* Dot Graph for daily tasks - fixed alignment and y-axis bar */}
                <div className="mt-0 mb-0 flex justify-center">
                  <svg width="600" height="200" viewBox="0 0 520 200">
                    {/* Y axis bar */}
                    <line x1="60" y1="30" x2="60" y2="170" stroke="#222" strokeWidth="2" />
                    {/* X axis */}
                    <line x1="60" y1="170" x2="500" y2="170" stroke="#222" />
                    {/* Dots for each day (example data) - smaller radius, more vertical space */}
                    {/* S */}
                    <circle cx="100" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="100" cy="90" r="7" fill="#bbb" />
                    <circle cx="100" cy="120" r="7" fill="#bbb" />
                    {/* M */}
                    <circle cx="160" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="160" cy="90" r="7" fill="#bbb" />
                    <circle cx="160" cy="120" r="7" fill="#bbb" />
                    <circle cx="160" cy="150" r="7" fill="#bbb" />
                    {/* T */}
                    <circle cx="220" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="220" cy="90" r="7" fill="#bbb" />
                    <circle cx="220" cy="120" r="7" fill="#bbb" />
                    <circle cx="220" cy="150" r="7" fill="#bbb" />
                    {/* W */}
                    <circle cx="280" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="280" cy="90" r="7" fill="#bbb" />
                    <circle cx="280" cy="120" r="7" fill="#bbb" />
                    <circle cx="280" cy="150" r="7" fill="#bbb" />
                    {/* T */}
                    <circle cx="340" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="340" cy="90" r="7" fill="#bbb" />
                    <circle cx="340" cy="120" r="7" fill="#bbb" />
                    {/* F */}
                    <circle cx="400" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="400" cy="90" r="7" fill="#bbb" />
                    <circle cx="400" cy="120" r="7" fill="#bbb" />
                    <circle cx="400" cy="150" r="7" fill="#bbb" />
                    {/* S */}
                    <circle cx="460" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="460" cy="90" r="7" fill="#bbb" />
                    <circle cx="460" cy="120" r="7" fill="#bbb" />
                    <circle cx="460" cy="150" r="7" fill="#bbb" />
                    {/* Day labels - spaced under dots */}
                    <text x="100" y="190" textAnchor="middle" fontSize="16">S</text>
                    <text x="160" y="190" textAnchor="middle" fontSize="16">M</text>
                    <text x="220" y="190" textAnchor="middle" fontSize="16">T</text>
                    <text x="280" y="190" textAnchor="middle" fontSize="16">W</text>
                    <text x="340" y="190" textAnchor="middle" fontSize="16">T</text>
                    <text x="400" y="190" textAnchor="middle" fontSize="16">F</text>
                    <text x="460" y="190" textAnchor="middle" fontSize="16">S</text>
                  </svg>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* On-going Tasks */}
                  <div>
                    <div className="font-semibold mb-2">On-going Tasks:</div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Learn Adobe Premier Pro</span>
                        <span>3/7 Days</span>
                      </div>
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Finish CSE471 Slide #2</span>
                        <span>5/7 Days</span>
                      </div>
                    </div>
                  </div>
                  {/* Completed Tasks */}
                  <div>
                    <div className="font-semibold mb-2">Completed Tasks:</div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Finish CSE321 Slide #4</span>
                        <span className="ml-2"><span className="inline-block w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">&#10003;</span></span>
                      </div>
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Watch "Uthshob" with friends</span>
                        <span className="ml-2"><span className="inline-block w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">&#10003;</span></span>
                      </div>
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
