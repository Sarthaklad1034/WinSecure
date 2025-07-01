import React, { useState, useEffect } from 'react';
import {
    Network,
    AlertTriangle,
    Activity,
    LogOut,
    File,
    LayoutDashboard,
    Search,
    User
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DashboardOverview from './Dashboard/DashboardOverview';
import './css/TesterDashboard.css';

const TesterDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
                <div className="dashboard-overview">
                    <div className="dashboard-welcome">
                        <h1>Welcome to WinSecure</h1>
                        <p>Your comprehensive security testing dashboard</p>
                    </div>
                    <DashboardOverview />
                </div>
            );
        }
        
        // For all other nested routes, use Outlet
        return <Outlet />;
    };

    return (
        <div className="tester-dashboard">
            <div className="sidebar">
                <div className="sidebar-logo">
                    <img 
                        src="/favicon.ico" 
                        alt="WinSecure Logo" 
                        className="logo-image"
                    />
                    <h1 className="winsecure-name">
                        <span className="win">Win</span>
                        <span className="secure">Secure</span>
                    </h1>
                </div>

                <nav className="sidebar-menu">
                    {getSidebarMenuItems().map((item) => (
                        <button
                            key={item.section || 'logout'}
                            className={`sidebar-menu-item ${isActiveRoute(item.section) ? 'active' : ''}`}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else if (item.path) {
                                    navigate(item.path);
                                }
                            }}
                        >
                            <item.icon size={20} />
                            <span className="label-large">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="main-content">
                {renderMainContent()}
            </div>
        </div>
    );
};

export default TesterDashboard;