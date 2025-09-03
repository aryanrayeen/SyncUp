import { create } from 'zustand';
import api from '../lib/axios';

export const useFitnessStore = create((set, get) => ({
  // Weight history for graph
  weightHistory: [],
  fetchWeightHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/weight/history');
      set({ weightHistory: response.data.weights || [], isLoading: false });
      return response.data.weights;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  // User fitness data
  userInfo: null,
  isLoading: false,
  error: null,
  
  // Exercise progress data
  todayExerciseProgress: 0,
  weeklyExerciseData: [],

  // Fetch user's latest fitness information
  fetchUserInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching user info...');
      const response = await api.get('/user-info');
      console.log('User info fetched:', response.data);
      set({ userInfo: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      
      // If it's a 404, it means no profile exists yet
      if (error.response?.status === 404) {
        console.log('No profile found (404) - user needs to complete profile setup');
        set({ 
          userInfo: null,
          error: null, // Don't treat 404 as an error for this case
          isLoading: false 
        });
        return null;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch user info';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return null;
    }
  },

  // Update user fitness information
  updateUserInfo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Updating user info:', data);
      const response = await api.post('/user-info', data);
      console.log('User info updated:', response.data);
      set({ userInfo: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error updating user info:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user info';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return null;
    }
  },

  // Get BMI category
  getBMICategory: (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-warning' };
    if (bmi < 25) return { category: 'Normal', color: 'text-success' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-warning' };
    return { category: 'Obese', color: 'text-error' };
  },

  // Calculate daily calorie deficit/surplus
  getCalorieBalance: () => {
    const { userInfo } = get();
    if (!userInfo) return 0;
    
    // This is a simplified calculation - in real app you'd track actual intake
    const estimatedBMR = userInfo.weight * 22; // Basic BMR estimation
    const exerciseCalories = userInfo.exerciseMinutes * 5; // ~5 cal per minute
    const totalBurned = estimatedBMR + exerciseCalories;
    
    return userInfo.caloriesIntake - totalBurned;
  },

  // Get progress percentage for daily goals
  getDailyProgress: () => {
    const { userInfo } = get();
    if (!userInfo) return { calories: 0, exercise: 0 };
    
    // Mock current progress - in real app this would come from daily tracking
    return {
      calories: Math.min(100, (userInfo.caloriesIntake / userInfo.caloriesIntake) * 75), // 75% of goal
      exercise: Math.min(100, (userInfo.exerciseMinutes / userInfo.exerciseMinutes) * 60) // 60% of goal
    };
  },

  // Fetch weekly fitness logs
  weeklyLogs: [],
  fetchWeeklyLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/fitness/summary/weekly');
      set({ weeklyLogs: response.data.logs || [], isLoading: false });
      return response.data.logs;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch weekly fitness logs', isLoading: false });
      return [];
    }
  },

  // Fetch today's exercise progress based on completed tasks
  fetchTodayExerciseProgress: async () => {
    try {
      const today = new Date();
      const year = today.getUTCFullYear();
      const month = String(today.getUTCMonth() + 1).padStart(2, '0');
      const day = String(today.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const response = await api.get(`/day-tasks/${dateStr}`);
      const dayData = response.data || { pending: [], completed: [] };
      
      const workoutTasks = [...dayData.pending, ...dayData.completed].filter(task => task.type === 'workout');
      const completedWorkouts = dayData.completed.filter(task => task.type === 'workout');
      
      const progress = workoutTasks.length === 0 ? 0 : (completedWorkouts.length / workoutTasks.length) * 100;
      
      set({ todayExerciseProgress: progress });
      return progress;
    } catch (error) {
      console.error('Error fetching today exercise progress:', error);
      set({ todayExerciseProgress: 0 });
      return 0;
    }
  },

  // Fetch weekly exercise data for charts
  fetchWeeklyExerciseData: async () => {
    try {
      const weekData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - i);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        try {
          const response = await api.get(`/day-tasks/${dateStr}`);
          const dayData = response.data || { pending: [], completed: [] };
          
          const workoutTasks = [...dayData.pending, ...dayData.completed].filter(task => task.type === 'workout');
          const completedWorkouts = dayData.completed.filter(task => task.type === 'workout');
          
          const progress = workoutTasks.length > 0 ? (completedWorkouts.length / workoutTasks.length) * 100 : 0;
          
          weekData.push({
            date: dateStr,
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            progress: progress,
            completed: completedWorkouts.length,
            total: workoutTasks.length
          });
        } catch (error) {
          weekData.push({
            date: dateStr,
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            progress: 0,
            completed: 0,
            total: 0
          });
        }
      }
      
      set({ weeklyExerciseData: weekData });
      return weekData;
    } catch (error) {
      console.error('Error fetching weekly exercise data:', error);
      set({ weeklyExerciseData: [] });
      return [];
    }
  },

  // Clear store data
  clearData: () => {
    set({ userInfo: null, isLoading: false, error: null, weeklyLogs: [] });
  }
}));
