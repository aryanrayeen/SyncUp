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
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Target, Activity, Heart, Scale, Plus, CheckCircle } from 'lucide-react';

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
    
    // Load financial data
    if (user?.monthlyBudget) {
      setMonthlyBudget(user.monthlyBudget);
    }
    fetchTransactions({ 
      month: new Date().getMonth() + 1, 
      year: new Date().getFullYear() 
    });
  }, [fetchUserInfo, fetchGoals, fetchTransactions, setMonthlyBudget, navigate, user]);

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

  // Mock weekly data for charts (in real app, this would come from backend)
  const weeklyCalorieData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calorie Intake',
        data: [
          userInfo.caloriesIntake * 0.95, 
          userInfo.caloriesIntake * 1.02, 
          userInfo.caloriesIntake * 0.88, 
          userInfo.caloriesIntake * 1.15, 
          userInfo.caloriesIntake * 0.92, 
          userInfo.caloriesIntake * 1.08, 
          userInfo.caloriesIntake * 0.97
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Target',
        data: Array(7).fill(userInfo.caloriesIntake),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const exerciseProgressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [dailyProgress.exercise, 100 - dailyProgress.exercise],
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-base-content/70 mt-2">Here's your fitness and wellness overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <Scale size={24} />
          </div>
          <div className="stat-title">Current Weight</div>
          <div className="stat-value text-primary">{userInfo.weight} kg</div>
          {userInfo.bmi && (
            <div className={`stat-desc ${bmiInfo?.color}`}>
              BMI: {userInfo.bmi.toFixed(1)} ({bmiInfo?.category})
            </div>
          )}
        </div>

        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <Activity size={24} />
          </div>
          <div className="stat-title">Exercise Goal</div>
          <div className="stat-value text-secondary">{userInfo.exerciseMinutes} min</div>
          <div className="stat-desc">{dailyProgress.exercise.toFixed(0)}% completed today</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <Heart size={24} />
          </div>
          <div className="stat-title">Calorie Target</div>
          <div className="stat-value text-accent">{userInfo.caloriesIntake}</div>
          <div className="stat-desc">
            {calorieBalance > 0 ? `+${calorieBalance}` : calorieBalance} cal balance
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-warning">
            <DollarSign size={24} />
          </div>
          <div className="stat-title">Monthly Budget</div>
          <div className="stat-value text-warning">{formatCurrency(monthlyBudget || 0)}</div>
          <div className={`stat-desc ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
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
              <Line data={weeklyCalorieData} options={chartOptions} />
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
              <div className="text-2xl font-bold">{dailyProgress.exercise.toFixed(0)}%</div>
              <div className="text-base-content/70">of daily goal completed</div>
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
