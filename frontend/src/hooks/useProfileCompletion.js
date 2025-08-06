import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export const useProfileCompletion = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  const checkProfileCompletion = useCallback(async () => {
    console.log('useProfileCompletion - isAuthenticated:', isAuthenticated);
    console.log('useProfileCompletion - user:', user);
    
    // Only check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping profile check');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Checking profile completion...');
      const response = await api.get('/user-info/profile-completion');
      console.log('Profile completion response:', response.data);
      setIsProfileComplete(response.data.isComplete);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // If there's an error, assume profile is not complete
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  // Provide a refresh function
  const refreshProfileCompletion = useCallback(async () => {
    console.log('Refreshing profile completion...');
    setIsLoading(true);
    
    try {
      console.log('Making fresh profile completion check...');
      const response = await api.get('/user-info/profile-completion');
      console.log('Fresh profile completion response:', response.data);
      setIsProfileComplete(response.data.isComplete);
      return response.data.isComplete;
    } catch (error) {
      console.error('Error refreshing profile completion:', error);
      setIsProfileComplete(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isProfileComplete, isLoading, refreshProfileCompletion };
};
