import { create } from 'zustand';
import api from '../lib/axios';

export const useGoalsStore = create((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  // Fetch all goals for the user
  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/goals');
      console.log('Goals fetched:', response.data);
      set({ goals: response.data.goals || [], isLoading: false });
      return response.data.goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch goals';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },

  // Add a new goal
  addGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      // Always include today's date if not provided
      const todayStr = new Date().toISOString().slice(0, 10);
      const response = await api.post('/goals', {
        ...goalData,
        date: goalData.date || todayStr
      });
      console.log('Goal added:', response.data);
      const newGoal = response.data.goal;
      set((state) => ({
        goals: [...state.goals, newGoal],
        isLoading: false
      }));
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add goal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update a goal
  updateGoal: async (goalId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/goals/${goalId}`, updates);
      console.log('Goal updated:', response.data);
      
      const updatedGoal = response.data.goal;
      set((state) => ({
        goals: state.goals.map(goal => 
          goal._id === goalId ? updatedGoal : goal
        ),
        isLoading: false
      }));
      
      return updatedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update goal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete a goal
  deleteGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/goals/${goalId}`);
      console.log('Goal deleted:', goalId);
      
      set((state) => ({
        goals: state.goals.filter(goal => goal._id !== goalId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting goal:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete goal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Toggle goal completion status
  toggleGoal: async (goalId) => {
    try {
      const goal = get().goals.find(g => g._id === goalId);
      if (!goal) return;

      const updates = {
        completed: !goal.completed,
        completionDate: !goal.completed ? new Date().toISOString() : null
      };

      await get().updateGoal(goalId, updates);
      
      // Dispatch goal completion event for achievement checking
      if (!goal.completed) {
        window.dispatchEvent(new CustomEvent('goalCompleted', { 
          detail: { goalId, goal: { ...goal, ...updates } } 
        }));
      }
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  },

  // Get goals by status
  getGoalsByStatus: (completed = false) => {
    return get().goals.filter(goal => goal.completed === completed);
  },

  // Get goal statistics
  getGoalStats: () => {
    const goals = get().goals;
    const completed = goals.filter(g => g.completed).length;
    const total = goals.length;
    const pending = total - completed;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      successRate
    };
  },

  // Clear all goals (for logout)
  clearGoals: () => {
    set({ goals: [], isLoading: false, error: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
