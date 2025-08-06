import { create } from 'zustand';

export const useProfileStore = create((set, get) => ({
  isProfileComplete: null,
  isLoading: false,
  
  setProfileComplete: (isComplete) => {
    set({ isProfileComplete: isComplete });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  markProfileAsComplete: () => {
    set({ isProfileComplete: true });
  },
  
  reset: () => {
    set({ isProfileComplete: null, isLoading: false });
  }
}));
