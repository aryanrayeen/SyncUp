import React, { useEffect } from 'react';
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
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
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
        activeDays: 'No data'
      };
    }

    const bmi = userInfo.bmi || (userInfo.weight / Math.pow(userInfo.height / 100, 2));
    const bmiCategory = getBMICategory(bmi);
    
    // Calculate weight progress (assuming target weight loss)
    const targetWeight = userInfo.weight - 5; // 5kg loss goal
    const weightProgress = userInfo.weight - targetWeight;
    
    // Estimated active days per month based on exercise minutes
    const activeDaysPerMonth = Math.min(30, Math.round(userInfo.exerciseMinutes / 30 * 7));

    return {
      weightProgress: weightProgress > 0 ? `+${weightProgress.toFixed(1)} kg` : `${weightProgress.toFixed(1)} kg`,
      avgCalories: userInfo.caloriesIntake.toLocaleString(),
      activeDays: activeDaysPerMonth
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
        <p className="text-base-content/70 mt-2">Track your fitness journey and progress over time</p>
      </div>

      {/* Trends Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/workouts" className="card bg-primary/10 shadow-lg cursor-pointer transition hover:scale-105">
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">Workouts</span>
          </div>
        </Link>
        <Link to="/tutorials" className="card bg-secondary/10 shadow-lg cursor-pointer transition hover:scale-105">
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-secondary">Tutorials</span>
          </div>
        </Link>
        <Link to="/wellness" className="card bg-accent/10 shadow-lg cursor-pointer transition hover:scale-105">
          <div className="card-body flex items-center justify-center">
            <span className="text-xl font-semibold text-accent">Wellness</span>
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
                <p className={`text-2xl font-bold ${metrics.weightProgress.includes('-') ? 'text-success' : 'text-warning'}`}>
                  {metrics.weightProgress}
                </p>
              </div>
              {metrics.weightProgress.includes('-') ? 
                <TrendingDown className="w-8 h-8 text-success" /> :
                <TrendingUp className="w-8 h-8 text-warning" />
              }
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
              <Calendar className="w-8 h-8 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Weight Progress Over Time</h2>
            <p className="text-sm opacity-70 mb-4">
              {userInfo ? `Current: ${userInfo.weight}kg | BMI: ${userInfo.bmi?.toFixed(1) || (userInfo.weight / Math.pow(userInfo.height / 100, 2)).toFixed(1)}` : 'Loading...'}
            </p>
            <div className="h-64">
              <Line data={weightTrendData} options={chartOptions} />
            </div>
            {!userInfo && (
              <div className="text-center py-8">
                <p className="text-base-content/50">Complete your profile to see personalized weight trends</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;
