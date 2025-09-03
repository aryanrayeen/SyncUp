import { useEffect } from 'react';
import { useAchievementsStore } from '../store/achievementsStore';
import { useAuthStore } from '../store/authStore';

const AchievementChecker = () => {
  const { isAuthenticated } = useAuthStore();
  const { initializeAchievements, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize achievements on mount (without notifications)
    initializeAchievements();

    // Set up periodic checking for new achievements
    const checkInterval = setInterval(() => {
      fetchAchievements();
    }, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(checkInterval);
  }, [isAuthenticated, initializeAchievements, fetchAchievements]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check for achievements when important events happen
    const handleTaskCompletion = () => {
      // Small delay to ensure backend has processed the completion
      setTimeout(() => {
        fetchAchievements();
      }, 1000);
    };

    const handleGoalCompletion = () => {
      setTimeout(() => {
        fetchAchievements();
      }, 1000);
    };

    const handleTransactionAdded = () => {
      setTimeout(() => {
        fetchAchievements();
      }, 1000);
    };

    // Listen for fitness task completions
    window.addEventListener('mealCompleted', handleTaskCompletion);
    window.addEventListener('workoutCompleted', handleTaskCompletion);
    
    // Listen for goal completions (if you have this event)
    window.addEventListener('goalCompleted', handleGoalCompletion);
    
    // Listen for financial transactions (if you have this event)
    window.addEventListener('transactionAdded', handleTransactionAdded);

    return () => {
      window.removeEventListener('mealCompleted', handleTaskCompletion);
      window.removeEventListener('workoutCompleted', handleTaskCompletion);
      window.removeEventListener('goalCompleted', handleGoalCompletion);
      window.removeEventListener('transactionAdded', handleTransactionAdded);
    };
  }, [isAuthenticated, fetchAchievements]);

  // This component doesn't render anything
  return null;
};

export default AchievementChecker;
