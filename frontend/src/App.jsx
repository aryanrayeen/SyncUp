import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SimpleDashboard from "./pages/SimpleDashboard";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	return children;
};

// redirect authenticated users to the dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated) {
		return <Navigate to='/' replace />;
	}

	return children;
};

function App() {
    const { checkAuth, isAuthenticated } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <div className="min-h-screen">
            <Routes>
                <Route
                    path='/'
                    element={
                        <ProtectedRoute>
                            <SimpleDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/signup'
                    element={
                        <RedirectAuthenticatedUser>
                            <SignUpPage />
                        </RedirectAuthenticatedUser>
                    }
                />
                <Route
                    path='/login'
                    element={
                        <RedirectAuthenticatedUser>
                            <LoginPage />
                        </RedirectAuthenticatedUser>
                    }
                />
                {/* catch all routes */}
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;