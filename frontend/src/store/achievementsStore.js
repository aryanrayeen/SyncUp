import api from '../lib/axios';
import { create } from 'zustand';

export const useAchievementsStore = create((set) => ({
  achievements: [],
  isLoading: false,
  error: null,

  fetchAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/achievements');
      set({ achievements: response.data.achievements, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
