import { create } from "zustand";
import api from "../lib/axios";
import { useProfileStore } from "./profileStore";

const API_URL = "/auth";

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    message: null,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/signup`, { email, password, name });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/login`, { email, password });

            console.log("Login response:", response); // added
            console.log("Response data:", response.data); // added

            set({
                isAuthenticated: true,
                user: response.data.user || null,
                error: null,
                isLoading: false,
            });
            
            // Reset profile store when user logs in to ensure fresh profile check
            useProfileStore.getState().reset();
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message); // added
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false, error: null, isLoading: false });
            // Reset profile store when user logs out
            useProfileStore.getState().reset();
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_URL}/check-auth`);
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ error: null, isLoading: false, isAuthenticated: false });
            // Reset profile store when auth check fails
            useProfileStore.getState().reset();
        }
    },

    updateUserProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            console.log('Updating user profile:', profileData);
            const response = await api.put(`${API_URL}/profile`, profileData);
            console.log('Profile updated successfully:', response.data);
            
            // Update the user state with the new data
            set((state) => ({
                user: { ...state.user, ...response.data.data },
                isLoading: false,
                error: null
            }));
            
            return response.data.data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },

    // Function to manually update user data (useful for profile picture updates)
    updateUser: (userData) => {
        set((state) => ({
            user: { ...state.user, ...userData }
        }));
    },
}));
