import { create } from 'zustand';
import api from '../lib/axios';

export const useFitnessStore = create((set, get) => ({
  // User fitness data
  userInfo: null,
  isLoading: false,
  error: null,

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

  // Clear store data
  clearData: () => {
    set({ userInfo: null, isLoading: false, error: null });
  }
}));
