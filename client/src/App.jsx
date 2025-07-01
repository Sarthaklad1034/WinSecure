// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './components/LoginPage';
// import AdminDashboard from './components/AdminDashboard';
// import TesterDashboard from './components/TesterDashboard';
// import VulnerabilityAssessmentPage from './components/VulnerabilityAssessmentPage';

// // Protected Route Component
// const ProtectedRoute = ({ children, requiredRole }) => {
//     const userRole = localStorage.getItem('userRole');

//     if (!userRole) {
//         // Not authenticated, redirect to login
//         return <Navigate to = "/login"
//         replace / > ;
//     }

//     if (userRole !== requiredRole) {
//         // Authenticated but wrong role, redirect to appropriate dashboard
//         return <Navigate
//         to = { userRole === 'admin' ? '/admin-dashboard' : '/dashboard' }
//         replace
//             /
//             >
//         ;
//     }

//     return children;
// };

// function App() {
//     return ( <
//         Router >
//         <
//         Routes > { /* Login Route */ } <
//         Route path = "/login"
//         element = { < LoginPage / > }
//         />

//         { /* Protected Admin Dashboard */ } <
//         Route path = "/admin-dashboard"
//         element = { <
//             ProtectedRoute requiredRole = "admin" >
//             <
//             AdminDashboard / >
//             <
//             /ProtectedRoute>
//         }
//         />

//         { /* Protected Tester Dashboard */ } <
//         Route path = "/dashboard"
//         element = { <
//             ProtectedRoute requiredRole = "tester" >
//             <
//             TesterDashboard / >
//             <
//             /ProtectedRoute>
//         }
//         />  


//         { /* Vulnerability Assessment Route */ } <
//         Route path = "/vulnerability-assessment"
//         element = { < VulnerabilityAssessmentPage / > }
//         />

//         { /* Default Redirect */ } <
//         Route path = "/"
//         element = { < Navigate to = "/login"
//             replace / >
//         }
//         />

//         { /* 404 Not Found */ } <
//         Route path = "*"
//         element = { <
//             div className = "flex items-center justify-center min-h-screen" >
//             <
//             h1 className = "text-2xl text-red-500" > 404 - Page Not Found < /h1> < /
//             div >
//         }
//         /> < /
//         Routes > <
//         /Router>
//     );
// }

// export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import TesterDashboard from './components/TesterDashboard';
import VulnerabilityAssessmentPage from './components/Dashboard/VulnerabilityAssessmentPage';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import ReportsSection from './components/Dashboard/ReportsSection';
import ProfileSection from './components/Dashboard/ProfileSection';

// Protected Route Component for Tester Authentication
const ProtectedRoute = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedAuth = sessionStorage.getItem('isAuthenticated');
                const storedRole = sessionStorage.getItem('userRole');

                if (storedAuth === 'true' && storedRole === 'tester') {
                    const response = await fetch('/check-auth', {
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.isAuthenticated && data.role === 'tester') {
                            setIsAuthenticated(true);
                        } else {
                            sessionStorage.clear();
                            setIsAuthenticated(false);
                        }
                    } else {
                        sessionStorage.clear();
                        setIsAuthenticated(false);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, []);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Redirect authenticated tester from login to dashboard
const LoginRedirect = ({ children }) => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    const userRole = sessionStorage.getItem('userRole');

    if (isAuthenticated && userRole === 'tester') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Login Route */}
                <Route 
                    path="/login" 
                    element={
                        <LoginRedirect>
                            <LoginPage />
                        </LoginRedirect>
                    } 
                />

                {/* Tester Dashboard with Nested Routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <TesterDashboard />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<DashboardOverview />} />
                    <Route path="vulnerability-assessment" element={<VulnerabilityAssessmentPage />} />
                    <Route path="reports" element={<ReportsSection />} />
                     <Route path="profile" element={<ProfileSection />} />
                </Route>

                {/* Optional direct routes */}
                <Route 
                    path="/vulnerability-assessment" 
                    element={
                        <ProtectedRoute>
                            <TesterDashboard />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/reports" 
                    element={
                        <ProtectedRoute>
                            <TesterDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* 404 Page */}
                <Route 
                    path="*" 
                    element={
                        <div className="flex items-center justify-center min-h-screen bg-gray-100">
                            <div className="text-center p-8">
                                <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
                                <h2 className="text-2xl text-gray-700 mb-4">Page Not Found</h2>
                                <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                                <button 
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
