import api from '../lib/axios';
import { create } from 'zustand';
import { useNotificationStore } from './notificationStore';

export const useAchievementsStore = create((set, get) => ({
  achievements: [],
  isLoading: false,
  error: null,
  previousEarnedAchievements: new Set(), // Track previously earned achievements

  fetchAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/achievements');
      const newAchievements = response.data.achievements;
      
      // Check for newly earned achievements
      const { previousEarnedAchievements } = get();
      const currentEarnedAchievements = new Set(
        newAchievements
          .filter(achievement => achievement.earned)
          .map(achievement => achievement._id)
      );

      // Find newly earned achievements
      const newlyEarned = newAchievements.filter(achievement => 
        achievement.earned && 
        !previousEarnedAchievements.has(achievement._id)
      );

      // Trigger notifications for newly earned achievements
      if (newlyEarned.length > 0) {
        const { addAchievementNotification } = useNotificationStore.getState();
        newlyEarned.forEach(achievement => {
          addAchievementNotification(achievement);
        });
      }

      set({ 
        achievements: newAchievements, 
        isLoading: false,
        previousEarnedAchievements: currentEarnedAchievements
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Initialize the store with current achievements (no notifications on first load)
  initializeAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/achievements');
      const achievements = response.data.achievements;
      
      // Set initial earned achievements without triggering notifications
      const earnedAchievements = new Set(
        achievements
          .filter(achievement => achievement.earned)
          .map(achievement => achievement._id)
      );

      set({ 
        achievements, 
        isLoading: false,
        previousEarnedAchievements: earnedAchievements
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Get earned achievements
  getEarnedAchievements: () => {
    const { achievements } = get();
    return achievements.filter(achievement => achievement.earned);
  },

  // Get progress towards unearned achievements
  getProgressAchievements: () => {
    const { achievements } = get();
    return achievements.filter(achievement => !achievement.earned);
  }
}));
