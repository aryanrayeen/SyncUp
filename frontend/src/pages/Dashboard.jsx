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
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Target, Activity, Heart, Scale } from 'lucide-react';

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
  }, [fetchUserInfo, navigate]);

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
        data: [0, userInfo.monthlyBudget], // No expenses yet for new user
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
          <div className="stat-value text-warning">${userInfo.monthlyBudget}</div>
          <div className="stat-desc">${userInfo.monthlyBudget} remaining</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Transactions */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Recent Transactions</h2>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-6xl mb-4">💳</div>
              <div className="text-center">
                <div className="text-lg font-semibold text-base-content/70">No recent transactions</div>
                <div className="text-sm text-base-content/50 mt-1">Your expenses will appear here</div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Tracker */}
        <div className="card bg-base-200 shadow-xl lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-lg">Goal Tracker</h2>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-center">
                <div className="text-lg font-semibold text-base-content/70">No goals set yet</div>
                <div className="text-sm text-base-content/50 mt-1">Start by adding your first goal</div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button className="btn btn-circle btn-primary">
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
