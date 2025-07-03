import React, { useState, useEffect } from 'react';
import {
    Network,
    AlertTriangle,
    Activity,
    LogOut,
    File,
    LayoutDashboard,
    Search,
    User,
    Menu,
    X
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DashboardOverview from './Dashboard/DashboardOverview';

const TesterDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Ensure only testers are allowed (and sessionStorage is used)
    useEffect(() => {
        const role = sessionStorage.getItem('userRole');
        if (role !== 'tester') {
            sessionStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // Redirect base /dashboard route to /dashboard/overview
    useEffect(() => {
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            navigate('/dashboard/overview', { replace: true });
        }
    }, [location.pathname, navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    // Helper function to determine if a menu item is active based on current route
    const isActiveRoute = (section) => {
        const currentPath = location.pathname;
        switch (section) {
            case 'overview':
                return currentPath === '/dashboard/overview';
            case 'vulnerability-assessment':
                return currentPath === '/dashboard/vulnerability-assessment';
            case 'reports':
                return currentPath === '/dashboard/reports';
            case 'profile':
                return currentPath === '/dashboard/profile';
            default:
                return false;
        }
    };

    const getSidebarMenuItems = () => [
        { 
            icon: LayoutDashboard, 
            label: 'Dashboard', 
            section: 'overview',
            path: '/dashboard/overview'
        },
        { 
            icon: Search, 
            label: 'Assessment', 
            section: 'vulnerability-assessment',
            path: '/dashboard/vulnerability-assessment'
        },
        { 
            icon: File, 
            label: 'Reports', 
            section: 'reports',
            path: '/dashboard/reports'
        },
        { 
            icon: User, 
            label: 'Profile', 
            section: 'profile',
            path: '/dashboard/profile'
        },
        { 
            icon: LogOut, 
            label: 'Logout', 
            action: handleLogout 
        }
    ];

    // Determine what content to show based on current route
    const renderMainContent = () => {
        const currentPath = location.pathname;
        
        // For the overview route, render the DashboardOverview component
        if (currentPath === '/dashboard/overview') {
            return (
<div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-7 py-5 rounded-2xl shadow-md flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-1">Welcome to WinSecure</h1>
        <p className="text-blue-100 text-sm">Your comprehensive security testing dashboard</p>
    </div>
    <DashboardOverview />
</div>

            );
        }
        
        // For all other nested routes, use Outlet
        return <Outlet />;
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 
                transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 transition-transform duration-300 ease-in-out
                bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl
                border-r-4 border-blue-500
            `}>
                {/* Logo Section */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-700 bg-blue-500 bg-opacity-10">
                    <img 
                        src="/favicon.ico" 
                        alt="WinSecure Logo" 
                        className="w-12 h-12 object-contain flex-shrink-0 drop-shadow-lg"
                    />
                    <h1 className="text-2xl font-bold">
                        <span className="text-blue-400">Win</span>
                        <span className="text-white">Secure</span>
                    </h1>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-col p-4 space-y-2 mt-4">
                    {getSidebarMenuItems().map((item) => (
                        <button
                            key={item.section || 'logout'}
                            className={`
                                flex items-center gap-3 px-6 py-4 rounded-xl font-medium text-left
                                transition-all duration-300 group relative overflow-hidden
                                ${isActiveRoute(item.section) 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform translate-x-2' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:translate-x-2'
                                }
                            `}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else if (item.path) {
                                    navigate(item.path);
                                    setIsSidebarOpen(false); // Close mobile sidebar
                                }
                            }}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            <span className="text-base">{item.label}</span>
                            
                            {/* Active indicator */}
                            {isActiveRoute(item.section) && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default TesterDashboard;