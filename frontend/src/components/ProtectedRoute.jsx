import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useEffect } from 'react';
import api from '../lib/axios';

const ProtectedRoute = ({ children, requiresProfile = true }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { isProfileComplete, isLoading, setProfileComplete, setLoading } = useProfileStore();

  // Check profile completion when component mounts
  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated || !user || !requiresProfile) {
        console.log('ProtectedRoute - Skipping profile check:', {
          isAuthenticated,
          hasUser: !!user,
          requiresProfile
        });
        return;
      }
      
      if (isProfileComplete === null) {
        console.log('ProtectedRoute - Starting profile completion check for user:', user.name);
        setLoading(true);
        
        // Small delay to ensure auth state is fully settled
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const response = await api.get('/user-info/profile-completion');
          console.log('ProtectedRoute - Profile completion response:', response.data);
          setProfileComplete(response.data.isComplete);
        } catch (error) {
          console.error('Error checking profile completion:', error);
          console.error('Error response:', error.response?.data);
          setProfileComplete(false);
        } finally {
          setLoading(false);
        }
      }
    };

    checkProfile();
  }, [isAuthenticated, user, requiresProfile, isProfileComplete, setProfileComplete, setLoading]);

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - requiresProfile:', requiresProfile);
  console.log('ProtectedRoute - isProfileComplete:', isProfileComplete);
  console.log('ProtectedRoute - isLoading:', isLoading);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If profile is not required (like profile setup page), allow access
  if (!requiresProfile) {
    console.log('Profile not required, allowing access');
    return children;
  }

  // If still checking profile completion, show loading
  if (isLoading) {
    console.log('Checking profile completion...');
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // If profile is required but not complete, redirect to setup
  if (isProfileComplete === false) {
    console.log('Profile not complete, redirecting to setup');
    return <Navigate to="/profile-setup" replace />;
  }

  console.log('All checks passed, rendering children');
  return children;
};

export default ProtectedRoute;
