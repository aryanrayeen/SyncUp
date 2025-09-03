import { create } from 'zustand';
import api from '../lib/axios';

export const useMealStore = create((set, get) => ({
  mealPlans: [],
  dailyMealLogs: [], // Track which meal plans were used on which days
  weeklyCalories: [], // Track daily calorie intake for the week
  isLoading: false,
  error: null,

  // Fetch all meal plans
  fetchMealPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/meal-plans');
      set({ mealPlans: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch meal plans', 
        isLoading: false 
      });
      return [];
    }
  },

  // Create a new meal plan
  createMealPlan: async (mealPlanData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/meal-plans', mealPlanData);
      const newMealPlan = response.data;
      set(state => ({ 
        mealPlans: [newMealPlan, ...state.mealPlans], 
        isLoading: false 
      }));
      return newMealPlan;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create meal plan', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Log a meal plan usage for a specific date
  logDailyMeal: async (mealPlanId, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/meal-logs', {
        mealPlanId,
        date: date || new Date().toISOString().split('T')[0]
      });
      
      // Update local state
      const { dailyMealLogs } = get();
      const dateStr = date || new Date().toISOString().split('T')[0];
      const updatedLogs = [...dailyMealLogs];
      const existingLogIndex = updatedLogs.findIndex(log => log.date === dateStr);
      
      if (existingLogIndex >= 0) {
        updatedLogs[existingLogIndex] = response.data;
      } else {
        updatedLogs.push(response.data);
      }
      
      set({ dailyMealLogs: updatedLogs, isLoading: false });
      
      // Refresh weekly calories data after logging meal
      get().fetchWeeklyCalories();
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to log meal', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get weekly calorie data for charts
  getWeeklyCalorieData: () => {
    const { weeklyCalories } = get();
    const weekData = [];
    const today = new Date();
    
    // Calculate weekly range starting from Sunday (same as Weekly Summary)
    const utcDayOfWeek = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
    const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - utcDayOfWeek));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setUTCDate(weekStart.getUTCDate() + i); // Sunday to Saturday
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = weeklyCalories.find(item => item.date === dateStr);
      weekData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayData?.totalCalories || 0
      });
    }
    
    return weekData;
  },

  // Fetch weekly calorie intake data
  fetchWeeklyCalories: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('MealStore - Fetching weekly calories...');
      const response = await api.get('/meal-logs/weekly');
      console.log('MealStore - Weekly calories response:', response.data);
      set({ weeklyCalories: response.data.weeklyData || [], isLoading: false });
      return response.data.weeklyData;
    } catch (error) {
      console.error('MealStore - Error fetching weekly calories:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch weekly calories', 
        isLoading: false 
      });
      return [];
    }
  },

  // Get today's total calories
  getTodayCalories: () => {
    const { weeklyCalories } = get();
    const today = new Date().toISOString().split('T')[0];
    const todayData = weeklyCalories.find(item => item.date === today);
    return todayData?.totalCalories || 0;
  },

  // Clear store data
  clearData: () => {
    set({ 
      mealPlans: [], 
      dailyMealLogs: [], 
      weeklyCalories: [], 
      isLoading: false, 
      error: null 
    });
  }
}));
