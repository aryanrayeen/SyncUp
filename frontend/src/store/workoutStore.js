import { create } from "zustand";
import api from "../lib/axios";

const API_URL = "/workouts";

export const useWorkoutStore = create((set, get) => ({
  exercises: [],
  workoutPlans: [],
  currentWorkoutPlan: null,
  isLoading: false,
  error: null,

  // Fetch all exercises
  fetchExercises: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`${API_URL}/exercises`);
      set({ exercises: response.data.exercises, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch exercises", 
        isLoading: false 
      });
    }
  },

  // Fetch exercises by category
  fetchExercisesByCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`${API_URL}/exercises/category/${category}`);
      set({ isLoading: false });
      return response.data.exercises;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch exercises", 
        isLoading: false 
      });
      return [];
    }
  },

  // Fetch user's workout plans
  fetchWorkoutPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`${API_URL}/plans`);
      set({ workoutPlans: response.data.workoutPlans, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch workout plans", 
        isLoading: false 
      });
    }
  },

  // Create a new workout plan
  createWorkoutPlan: async (planData) => {
    console.log('Store: Creating workout plan with data:', planData);
    set({ isLoading: true, error: null });
    try {
      console.log('Store: Making API request to:', `${API_URL}/plans`);
      const response = await api.post(`${API_URL}/plans`, planData);
      console.log('Store: API response:', response.data);
      const newPlan = response.data.workoutPlan;
      set(state => ({ 
        workoutPlans: [newPlan, ...state.workoutPlans], 
        isLoading: false 
      }));
      console.log('Store: Workout plan created successfully');
      return newPlan;
    } catch (error) {
      console.error('Store: Error creating workout plan:', error);
      console.error('Store: Error response:', error.response?.data);
      set({ 
        error: error.response?.data?.message || "Failed to create workout plan", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Update workout plan
  updateWorkoutPlan: async (planId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`${API_URL}/plans/${planId}`, updates);
      const updatedPlan = response.data.workoutPlan;
      set(state => ({
        workoutPlans: state.workoutPlans.map(plan => 
          plan._id === planId ? updatedPlan : plan
        ),
        currentWorkoutPlan: state.currentWorkoutPlan?._id === planId ? updatedPlan : state.currentWorkoutPlan,
        isLoading: false
      }));
      return updatedPlan;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to update workout plan", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete workout plan
  deleteWorkoutPlan: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`${API_URL}/plans/${planId}`);
      set(state => ({
        workoutPlans: state.workoutPlans.filter(plan => plan._id !== planId),
        currentWorkoutPlan: state.currentWorkoutPlan?._id === planId ? null : state.currentWorkoutPlan,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to delete workout plan", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Add exercise to workout plan
  addExerciseToWorkoutPlan: async (planId, exerciseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`${API_URL}/plans/${planId}/exercises`, exerciseData);
      const updatedPlan = response.data.workoutPlan;
      set(state => ({
        workoutPlans: state.workoutPlans.map(plan => 
          plan._id === planId ? updatedPlan : plan
        ),
        currentWorkoutPlan: state.currentWorkoutPlan?._id === planId ? updatedPlan : state.currentWorkoutPlan,
        isLoading: false
      }));
      return updatedPlan;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to add exercise to workout plan", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Remove exercise from workout plan
  removeExerciseFromWorkoutPlan: async (planId, exerciseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`${API_URL}/plans/${planId}/exercises/${exerciseId}`);
      const updatedPlan = response.data.workoutPlan;
      set(state => ({
        workoutPlans: state.workoutPlans.map(plan => 
          plan._id === planId ? updatedPlan : plan
        ),
        currentWorkoutPlan: state.currentWorkoutPlan?._id === planId ? updatedPlan : state.currentWorkoutPlan,
        isLoading: false
      }));
      return updatedPlan;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to remove exercise from workout plan", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Set current workout plan
  setCurrentWorkoutPlan: (plan) => {
    set({ currentWorkoutPlan: plan });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Seed exercises
  seedExercises: async () => {
    try {
      await api.post(`${API_URL}/seed-exercises`);
    } catch (error) {
      console.error('Error seeding exercises:', error);
    }
  }
}));
