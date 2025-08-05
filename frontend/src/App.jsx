import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";


// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated) {
		return <Navigate to='/' replace />;
	}

	return children;
};

function App() {
    return (
        <div className="min-h-screen flex flex-col" data-theme="garden">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    <Route
                        path='/'
                        element={<Navigate to='/login' replace />}
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
                    <Route path='*' element={<Navigate to='/login' replace />} />
                </Routes>
            </main>
            <Footer />
            <Toaster />
        </div>
    );
}

export default App;