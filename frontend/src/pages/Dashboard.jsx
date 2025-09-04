import React, { useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useFitnessStore } from '../store/fitnessStore';
import { useAuthStore } from '../store/authStore';
import { useGoalsStore } from '../store/goalsStore';
import { useFinanceStore } from '../store/financeStore';
import { useMealStore } from '../store/mealStore';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Target, Activity, Heart, Scale, Plus, CheckCircle } from 'lucide-react';
import useDayTasks, { formatDateUTC } from '../lib/useDayTasks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    userInfo, 
    fetchUserInfo, 
    getBMICategory, 
    getCalorieBalance, 
    getDailyProgress,
    fetchWeeklyLogs,
    weeklyLogs,
    isLoading,
    error
  } = useFitnessStore();

  const {
    goals,
    fetchGoals,
    getGoalStats,
    toggleGoal,
    isLoading: goalsLoading
  } = useGoalsStore();

  const {
    transactions,
    monthlyBudget,
    fetchTransactions,
    getCurrentMonthExpenses,
    getCurrentMonthIncome,
    getRemainingBudget,
    getBudgetUsagePercentage,
    getRecentTransactions,
    setMonthlyBudget,
    isLoading: financeLoading
  } = useFinanceStore();

  const {
    fetchWeeklyCalories,
    getWeeklyCalorieData,
    getTodayCalories,
    weeklyCalories,
    isLoading: mealLoading
  } = useMealStore();

  // Use the same hook as Weekly Summary for real-time task data
  const { dayTasks } = useDayTasks();

  useEffect(() => {
    const loadUserInfo = async () => {
      console.log('Dashboard - Loading user info...');
      const result = await fetchUserInfo();
      
      // If fetchUserInfo returns null or gets a 404, it means no profile exists
      if (result === null) {
        console.log('Dashboard - No user profile found, redirecting to profile setup');
        navigate('/profile-setup', { replace: true });
      }
    };
    
    loadUserInfo();
    fetchGoals(); // Load goals when dashboard loads
    
    // Load fitness data
    fetchWeeklyLogs();
    
    // Load meal data
    fetchWeeklyCalories();
    
    // Load financial data
    if (user?.monthlyBudget) {
      setMonthlyBudget(user.monthlyBudget);
    }
    fetchTransactions({ 
      month: new Date().getMonth() + 1, 
      year: new Date().getFullYear() 
    });
  }, [fetchUserInfo, fetchGoals, fetchWeeklyLogs, fetchWeeklyCalories, fetchTransactions, setMonthlyBudget, navigate, user]);

  // Refresh data when window gains focus (useful for real-time updates)
  useEffect(() => {
    const handleFocus = () => {
      fetchWeeklyLogs();
      fetchWeeklyCalories();
    };

    const handleMealCompleted = () => {
      console.log('Dashboard: Meal completed event received, refreshing data...');
      fetchWeeklyCalories();
    };

    const handleWorkoutCompleted = async () => {
      console.log('Dashboard: Workout completed event received, refreshing data...');
      fetchWeeklyLogs();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('mealCompleted', handleMealCompleted);
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mealCompleted', handleMealCompleted);
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
    };
  }, []); // Remove dependencies to prevent infinite loops

  if (isLoading && !userInfo) {
    console.log('Dashboard - Loading user info...');
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!userInfo) {
    console.log('Dashboard - No user info, showing setup prompt');
    return (
      <div className="p-6">
        <div className="alert alert-info">
          <span>Complete your profile setup to view your dashboard.</span>
        </div>
      </div>
    );
  }

  console.log('Dashboard - Rendering with user info:', userInfo);

  const bmiInfo = userInfo.bmi ? getBMICategory(userInfo.bmi) : null;
  const calorieBalance = getCalorieBalance();
  const dailyProgress = getDailyProgress();

  // Calculate today's exercise progress using dayTasks (same as Weekly Summary)
  const today = new Date();
  const todayDateStr = formatDateUTC(today);
  const todayTasks = dayTasks[todayDateStr] || { pending: [], completed: [] };
  const todayWorkoutTasks = [...todayTasks.pending, ...todayTasks.completed].filter(task => task.type === 'workout');
  const todayCompletedWorkouts = todayTasks.completed.filter(task => task.type === 'workout');
  const todayExerciseProgress = todayWorkoutTasks.length === 0 ? 0 : (todayCompletedWorkouts.length / todayWorkoutTasks.length) * 100;

  // Calculate today's meal progress using dayTasks
  const todayMealTasks = [...todayTasks.pending, ...todayTasks.completed].filter(task => task.type === 'meal');
  const todayCompletedMeals = todayTasks.completed.filter(task => task.type === 'meal');
  const todayCaloriesFromTasks = todayCompletedMeals
    .filter(meal => meal.calories)
    .reduce((sum, meal) => sum + meal.calories, 0);

  // Get real data for charts
  const weeklyCalorieData = getWeeklyCalorieData();
  const todayCalories = getTodayCalories() || todayCaloriesFromTasks; // Fallback to task-based calculation

  // Debug logging
  console.log('Dashboard - Weekly calorie data:', weeklyCalorieData);
  console.log('Dashboard - Today calories:', todayCalories);
  console.log('Dashboard - Today exercise progress:', todayExerciseProgress);
  console.log('Dashboard - Today tasks:', todayTasks);

  // Finance calculations
  const currentMonthExpenses = getCurrentMonthExpenses();
  const currentMonthIncome = getCurrentMonthIncome();
  const remainingBudget = getRemainingBudget();
  const budgetUsage = getBudgetUsagePercentage();
  const recentTransactions = getRecentTransactions();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Real weekly calorie chart data - use dayTasks if mealStore data is empty
  let weeklyCalorieChartData;
  
  if (weeklyCalorieData && weeklyCalorieData.length > 0 && weeklyCalorieData.some(day => day.calories > 0)) {
    // Use mealStore data if available and has real data
    weeklyCalorieChartData = {
      labels: weeklyCalorieData.map(day => day.day),
      datasets: [
        {
          label: 'Calorie Intake',
          data: weeklyCalorieData.map(day => day.calories),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Target',
          data: weeklyCalorieData.map(() => userInfo?.caloriesIntake || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
        },
      ],
    };
  } else {
    // Fallback to dayTasks data (same calculation as Weekly Summary)
    // Calculate weekly range starting from Sunday (same as Weekly Summary)
    const today = new Date();
    const utcDayOfWeek = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
    const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - utcDayOfWeek));
    
    const weeklyCaloriesFromTasks = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setUTCDate(weekStart.getUTCDate() + i); // Sunday to Saturday
      const dateStr = formatDateUTC(d);
      const dayData = dayTasks[dateStr] || { pending: [], completed: [] };
      const calories = dayData.completed
        .filter(t => t.type === 'meal' && t.calories)
        .reduce((sum, t) => sum + t.calories, 0);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories
      };
    });

    weeklyCalorieChartData = {
      labels: weeklyCaloriesFromTasks.map(day => day.day),
      datasets: [
        {
          label: 'Calorie Intake',
          data: weeklyCaloriesFromTasks.map(day => day.calories),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Target',
          data: weeklyCaloriesFromTasks.map(() => userInfo?.caloriesIntake || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
        },
      ],
    };
  }

  const exerciseProgressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [todayExerciseProgress, 100 - todayExerciseProgress],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyBudgetData = {
    labels: ['Used', 'Remaining'],
    datasets: [
      {
        data: [currentMonthExpenses, Math.max(0, remainingBudget)],
        backgroundColor: ['#f59e0b', '#22c55e'],
        borderWidth: 0,
      },
    ],
  };

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

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-sm sm:text-base text-base-content/70 mt-1 sm:mt-2">Here's your fitness and wellness overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="stat bg-base-200 rounded-lg shadow p-4 min-h-0">
          <div className="stat-figure text-primary flex-shrink-0">
            <Scale size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm truncate">Current Weight</div>
          <div className="stat-value text-primary text-lg sm:text-2xl break-words">{userInfo.weight} kg</div>
          {userInfo.bmi && (
            <div className={`stat-desc text-gray-500 text-xs sm:text-sm ${bmiInfo?.color} truncate`}>
              BMI: {userInfo.bmi.toFixed(1)} ({bmiInfo?.category})
            </div>
          )}
        </div>

        <div className="stat bg-base-200 rounded-lg shadow p-4 min-h-0">
          <div className="stat-figure text-secondary flex-shrink-0">
            <Activity size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm truncate">Workouts for Today</div>
          <div className="stat-value text-secondary text-lg sm:text-2xl break-words">{
            (() => {
              // Get number of pending workouts for today from Fitness page's pending box
              const today = new Date();
              const todayDateStr = formatDateUTC(today);
              const todayTasks = dayTasks[todayDateStr] || { pending: [], completed: [] };
              const pendingWorkouts = todayTasks.pending.filter(task => task.type === 'workout');
              return pendingWorkouts.length;
            })()
          }</div>
          <div className="stat-desc text-xs sm:text-sm truncate">pending workouts</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow p-4 min-h-0">
          <div className="stat-figure text-red-600 flex-shrink-0">
            <Heart size={20} className="sm:w-6 sm:h-6" />
          </div>
            <div className="stat-title text-xs sm:text-sm truncate">Calories Consumed this week</div>
            <div className="stat-value text-green-600 text-lg sm:text-2xl break-words">{
              (() => {
                // Calculate total calories for the current week from completed meal tasks
                const today = new Date();
                const utcDayOfWeek = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
                const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - utcDayOfWeek));
                let totalCalories = 0;
                for (let i = 0; i < 7; i++) {
                  const d = new Date(weekStart);
                  d.setUTCDate(weekStart.getUTCDate() + i);
                  const dateStr = formatDateUTC(d);
                  const dayData = dayTasks[dateStr] || { pending: [], completed: [] };
                  totalCalories += dayData.completed
                    .filter(t => t.type === 'meal' && t.calories)
                    .reduce((sum, t) => sum + t.calories, 0);
                }
                return totalCalories;
              })()
            } cal</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow p-4 min-h-0">
          <div className="stat-figure text-green-600 flex-shrink-0">
            <DollarSign size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm truncate">Monthly Budget</div>
          <div className="stat-value text-blue-500 text-lg sm:text-2xl break-words overflow-hidden">
            <span className="block truncate">{formatCurrency(monthlyBudget || 0)}</span>
          </div>
          <div className={`stat-desc text-xs sm:text-sm truncate ${remainingBudget >= 0 ? 'text-green-600' : 'text-error'}`}>
            {formatCurrency(remainingBudget)} remaining
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Intake Chart */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Weekly Calorie Intake</h2>
            <div className="h-64">
              <Line data={weeklyCalorieChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Exercise Progress */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Today's Exercise Progress</h2>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut data={exerciseProgressData} options={doughnutOptions} />
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold">{todayExerciseProgress.toFixed(0)}%</div>
              <div className="text-base-content/70">of daily exercise plans completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Transactions */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <h2 className="card-title text-lg">Recent Transactions</h2>
              <button 
                onClick={() => navigate('/expenses')}
                className="btn btn-circle btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {financeLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="text-6xl mb-4">💳</div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-base-content/70">No recent transactions</div>
                  <div className="text-sm text-base-content/50 mt-1">Your expenses will appear here</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-2 bg-base-100 rounded hover:bg-base-200 transition-colors">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {transaction.description || transaction.category}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} • {transaction.category}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
                <div className="text-center pt-1">
                  <button 
                    onClick={() => navigate('/expenses')}
                    className="text-primary text-xs hover:underline"
                  >
                    View all transactions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goal Tracker */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <h2 className="card-title text-lg">Goal Tracker</h2>
              <button 
                onClick={() => navigate('/goals')}
                className="btn btn-circle btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {goalsLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto text-base-content/30 mb-2" />
                  <div className="text-sm font-medium text-base-content/70">No goals set yet</div>
                  <div className="text-xs text-base-content/50 mt-1">Click + to add your first goal</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal._id} className="flex items-center gap-2 p-2 bg-base-100 rounded hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal._id)}
                      className={`checkbox checkbox-xs ${goal.completed ? 'checkbox-success' : 'checkbox-primary'} cursor-pointer`}
                    />
                    <span className={`flex-1 text-sm cursor-pointer ${goal.completed ? 'line-through opacity-60' : ''}`}>
                      {goal.title.length > 40 ? `${goal.title.substring(0, 40)}...` : goal.title}
                    </span>
                    {goal.completed && (
                      <CheckCircle className="w-3 h-3 text-success" />
                    )}
                  </div>
                ))}
                {goals.length > 4 && (
                  <div className="text-center pt-1">
                    <button 
                      onClick={() => navigate('/goals')}
                      className="text-primary text-xs hover:underline"
                    >
                      +{goals.length - 4} more goals
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
