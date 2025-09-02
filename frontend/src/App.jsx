import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Trends from './pages/Trends'
import Goals from './pages/Goals'
import ExpensesPage from './pages/ExpensesPage'
import UserProfile from './pages/UserProfile'
import WeeklySummary from './pages/WeeklySummary'
import Achievements from './pages/Achievements'
import ProfileSetupPage from './pages/ProfileSetupPage'
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Tutorials from './pages/Tutorials'
import Wellness from './pages/Wellness'
import Workouts from './pages/Workouts'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from "react-hot-toast";
import ChatBot from "./components/ChatBot";
import { useAuthStore } from "./store/authStore";

import MealPlan from "./pages/MealPlan";

// redirect authenticated users to the dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

function App() {
    const { checkAuth, isAuthenticated } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <div data-theme="acid" className="min-h-screen bg-base-100">
            <ChatBot />
            <Routes>
                {/* Auth Routes */}
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
                
                {/* Profile Setup Route (authenticated but no profile check) */}
                <Route
                    path="/profile-setup"
                    element={
                        <ProtectedRoute requiresProfile={false}>
                            <ProfileSetupPage />
                        </ProtectedRoute>
                    }
                />
                
                {/* Protected Routes with Navbar and Sidebar */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requiresProfile={false}>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <Dashboard />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trends"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <Trends />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tutorials"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <Tutorials />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wellness"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <Wellness />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workouts"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <Workouts />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/goals"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <Goals />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/expenses"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <ExpensesPage />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <UserProfile />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/meal-plan"
                    element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1">
                                        <MealPlan />
                                    </main>
                                </div>
                            </>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/weekly-summary"
                    element={
                        <ProtectedRoute>
                            <WeeklySummary />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/achievements"
                    element={
                        <ProtectedRoute>
                            <Achievements />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;