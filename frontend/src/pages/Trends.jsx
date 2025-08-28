import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Calendar from 'react-calendar';
import { useFitnessStore } from '../store/fitnessStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
  );
import { useWorkoutStore } from '../store/workoutStore';
import api from '../lib/axios';
import useDayTasks, { formatDateUTC } from '../lib/useDayTasks';
import 'react-calendar/dist/Calendar.css';


function PendingCompletedSection() {
  // Use shared hook for all per-date task logic
  const { dayTasks, addPending, complete, uncomplete, remove } = useDayTasks();
  // Persist selectedDate in localStorage to survive refresh
  const getInitialSelectedDate = () => {
    const stored = localStorage.getItem('selectedDate');
    if (stored) {
      // Always parse as UTC
      const d = new Date(stored);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
    // Default to today in UTC
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  };
  const [selectedDate, setSelectedDateState] = useState(getInitialSelectedDate);
  // Wrap setSelectedDate to persist to localStorage
  const setSelectedDate = (date) => {
    // Always store as ISO string (UTC)
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    localStorage.setItem('selectedDate', utcDate.toISOString());
    setSelectedDateState(utcDate);
  };
  const [showPopup, setShowPopup] = useState(false);

  // Workout plans from Zustand store
  const { workoutPlans, fetchWorkoutPlans, isLoading: loadingWorkouts, error: errorWorkouts } = useWorkoutStore();
  const [mealPlans, setMealPlans] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [errorMeals, setErrorMeals] = useState(null);

  // Fetch meal plans on mount
  useEffect(() => {
    const fetchMeals = async () => {
      setLoadingMeals(true);
      try {
        const res = await api.get('/meal-plans');
        setMealPlans(res.data);
        setErrorMeals(null);
      } catch (err) {
        setErrorMeals('Failed to load saved meal plans');
      } finally {
        setLoadingMeals(false);
      }
    };
    fetchMeals();
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  // All items available to add
  const realItems = [
    ...workoutPlans.map((w) => ({ id: w._id, type: 'workout', name: w.name || w.title || 'Workout Plan' })),
    ...mealPlans.map((m) => ({ id: m._id, type: 'meal', name: m.name || m.title || 'Meal Plan' })),
  ];

  // Format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().slice(0, 10);
  // Use UTC date string for all keys
  const selectedDateStr = formatDateUTC(selectedDate);
  // Get tasks for selected date
  const pending = dayTasks[selectedDateStr]?.pending || [];
  const completed = dayTasks[selectedDateStr]?.completed || [];

  // Use shared hook actions
  // Helper to add calories to meal plan items
  const withMealCalories = (item) => {
    if (item.type === 'meal') {
      const meal = mealPlans.find(m => m._id === item.id);
      // Always attach calories, fallback to 0 if not found
      return { ...item, calories: meal && typeof meal.calories === 'number' ? meal.calories : 0 };
    }
    return item;
  };

  const handleAdd = async (item) => {
    await addPending(selectedDate, withMealCalories(item));
    setShowPopup(false);
  };
  const handleComplete = async (item) => { await complete(selectedDate, withMealCalories(item)); };
  const handleUncomplete = async (item) => { await uncomplete(selectedDate, item); };
  const handleDelete = async (item) => { await remove(selectedDate, item); };

  return (
    <div className="mt-10">
      {/* Pending/Completed Boxes for selected date */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-base-content">
          Fitness Tasks for {formatDateUTC(selectedDate)} (UTC)
        </h2>
        <button
          className="btn btn-primary btn-circle"
          onClick={() => setShowPopup(true)}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-warning">Pending</h3>
            <div className="space-y-3 mt-4">
              {pending.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  No pending items for this day
                </div>
              ) : (
                pending.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-base-100 rounded-lg border-l-4 border-primary"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        onChange={() => handleComplete(item)}
                      />
                      <span>
                        {item.name}{' '}
                        <span className="text-xs text-base-content/40">
                          ({item.type})
                        </span>
                      </span>
                    </div>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleDelete(item)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-success">Completed</h3>
            <div className="space-y-3 mt-4">
              {completed.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  No completed items for this day
                </div>
              ) : (
                completed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-base-100 rounded-lg border-l-4 border-success"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-success"
                        checked
                        readOnly
                        onClick={() => handleUncomplete(item)}
                      />
                      <span className="line-through text-success">
                        {item.name}{' '}
                        <span className="text-xs text-base-content/40">
                          ({item.type})
                        </span>
                      </span>
                    </div>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleDelete(item)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar with dots below boxes */}
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-xl font-bold mb-2">Calendar</h3>
        <div className="bg-base-200 p-4 rounded-lg shadow-md">
            <Calendar
              value={selectedDate}
              onClickDay={(date) => {
                // Always treat calendar date as UTC (calendar gives local midnight)
                const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                setSelectedDate(utcDate);
                setShowPopup(true);
              }}
              tileContent={({ date }) => {
                // Always treat calendar date as UTC
                const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                const dateStr = formatDateUTC(utcDate);
                const tasks = dayTasks[dateStr] || { pending: [], completed: [] };
                const dots = [];
                // Grey for pending, green for completed
                for (let i = 0; i < tasks.pending.length; i++) {
                  dots.push(
                    <span
                      key={`p${i}`}
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#888',
                        margin: 1,
                      }}
                    ></span>
                  );
                }
                for (let i = 0; i < tasks.completed.length; i++) {
                  dots.push(
                    <span
                      key={`c${i}`}
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#22c55e',
                        margin: 1,
                      }}
                    ></span>
                  );
                }
                return <div style={{ marginTop: 2, textAlign: 'center' }}>{dots}</div>;
              }}
            />
        </div>
      </div>

      {/* Popup for adding tasks to selected date */}
      {showPopup && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Tasks for {formatDateUTC(selectedDate)} (UTC)
            </h3>
            <div className="mb-4">
              <div className="font-semibold mb-2">Pending:</div>
              {pending.length === 0 ? (
                <div className="text-base-content/60 mb-2">No pending tasks.</div>
              ) : (
                pending.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-base-100 border-l-4 border-base-300 mb-1"
                  >
                    <span>
                      {item.name}{' '}
                      <span className="text-xs text-base-content/40">
                        ({item.type})
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-success"
                        onClick={() => handleComplete(item)}
                      >
                        Complete
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="font-semibold mt-4 mb-2">Completed:</div>
              {completed.length === 0 ? (
                <div className="text-base-content/60 mb-2">No completed tasks.</div>
              ) : (
                completed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-base-100 border-l-4 border-success mb-1"
                  >
                    <span className="line-through text-success">
                      {item.name}{' '}
                      <span className="text-xs text-base-content/40">
                        ({item.type})
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-warning"
                        onClick={() => handleUncomplete(item)}
                      >
                        Uncomplete
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Add Task</h4>
              {loadingMeals || loadingWorkouts ? (
                <div className="text-center py-4">Loading...</div>
              ) : errorMeals || errorWorkouts ? (
                <div className="text-error">{errorMeals || errorWorkouts}</div>
              ) : realItems.length === 0 ? (
                <div className="text-base-content/60">
                  No meal or workout plans found.
                </div>
              ) : (
                realItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-base-100 border-l-4 border-base-300 mb-1"
                  >
                    <span>
                      {item.name}{' '}
                      <span className="text-xs text-base-content/40">
                        ({item.type})
                      </span>
                    </span>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => handleAdd(item)}
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// End of PendingCompletedSection

// --- End of PendingCompletedSection, start of Trends component ---
const Trends = () => {
  const { userInfo, fetchUserInfo, isLoading, error, getBMICategory } = useFitnessStore();

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Generate sample weight progress data based on current weight
  const generateWeightTrendData = () => {
    if (!userInfo) return { labels: [], datasets: [] };

    const currentWeight = userInfo.weight;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // Generate a realistic weight loss progression
    const weightData = months.map((_, index) => {
      return currentWeight + (5 - index); // Shows 5kg loss over 6 months
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Weight (kg)',
          data: weightData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const weightTrendData = generateWeightTrendData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Calculate fitness metrics from real data
  const calculateFitnessMetrics = () => {
    if (!userInfo) {
      return {
        weightProgress: 'No data',
        avgCalories: 'No data',
        activeDays: 'No data',
      };
    }

    const bmi =
      userInfo.bmi ||
      userInfo.weight / Math.pow(userInfo.height / 100, 2);
    const bmiCategory = getBMICategory(bmi);

    // Calculate weight progress (assuming target weight loss)
    const targetWeight = userInfo.weight - 5; // 5kg loss goal
    const weightProgress = userInfo.weight - targetWeight;

    // Estimated active days per month based on exercise minutes
    const activeDaysPerMonth = Math.min(
      30,
      Math.round((userInfo.exerciseMinutes / 30) * 7)
    );

    return {
      weightProgress:
        weightProgress > 0
          ? `+${weightProgress.toFixed(1)} kg`
          : `${weightProgress.toFixed(1)} kg`,
      avgCalories: userInfo.caloriesIntake.toLocaleString(),
      activeDays: activeDaysPerMonth,
    };
  };

  const metrics = calculateFitnessMetrics();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content">Fitness & Progress</h1>
        <p className="text-base-content/70 mt-2">
          Track your fitness journey and progress over time
        </p>
      </div>

      {/* Trends Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/workouts"
          className="card bg-primary/10 shadow-lg cursor-pointer transition hover:scale-105"
        >
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">Workouts</span>
          </div>
        </Link>
        <Link
          to="/tutorials"
          className="card bg-secondary/10 shadow-lg cursor-pointer transition hover:scale-105"
        >
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-secondary">Tutorials</span>
          </div>
        </Link>
        <Link
          to="/wellness"
          className="card bg-accent/10 shadow-lg cursor-pointer transition hover:scale-105"
        >
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-accent">Wellness</span>
          </div>
        </Link>
        {/* Meal Plan Button */}
        <Link
          to="/meal-plan"
          className="card bg-info/10 shadow-lg cursor-pointer transition hover:scale-105 md:col-span-3"
        >
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-info">Generate Meal Plan</span>
          </div>
        </Link>
      </div>

      {/* Fitness Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Weight Progress</p>
                <p
                  className={`text-2xl font-bold ${
                    metrics.weightProgress.includes('-')
                      ? 'text-success'
                      : 'text-warning'
                  }`}
                >
                  {metrics.weightProgress}
                </p>
              </div>
              {metrics.weightProgress.includes('-') ? (
                <TrendingDown className="w-8 h-8 text-success" />
              ) : (
                <TrendingUp className="w-8 h-8 text-warning" />
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Daily Calories Target</p>
                <p className="text-2xl font-bold">{metrics.avgCalories}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Est. Active Days/Month</p>
                <p className="text-2xl font-bold text-info">{metrics.activeDays}</p>
              </div>
              {/* Removed extra calendar icon */}
            </div>
          </div>
        </div>
      </div>

      {/* Pending/Completed Section */}
      <PendingCompletedSection />

      {/* Weight Progress Chart */}
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Weight Progress Over Time</h2>
            <p className="text-sm opacity-70 mb-4">
              {userInfo
                ? `Current: ${userInfo.weight}kg | BMI: ${userInfo.bmi?.toFixed(1) || (
                    userInfo.weight / Math.pow(userInfo.height / 100, 2)
                  ).toFixed(1)}`
                : 'Loading...'}
            </p>
            <div className="h-64">
              <Line data={weightTrendData} options={chartOptions} />
            </div>
            {!userInfo && (
              <div className="text-center py-8">
                <p className="text-base-content/50">
                  Complete your profile to see personalized weight trends
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;