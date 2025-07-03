import React, { useState, useEffect } from 'react';
import { Network, Shield, FileText, Target, AlertTriangle, Play, Users, Settings, Eye, ChevronRight, Zap, Search, FileCheck, Book, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardOverview = () => {
    const navigate = useNavigate();
    const [dashboardStats, setDashboardStats] = useState({
        targetsSearched: 0,
        vulnerableTargets: 0,
        recentReportDate: 'No reports yet'
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/reports', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success && data.reports) {
                const reports = data.reports;
                
                // Calculate unique targets searched
                const uniqueTargets = new Set(reports.map(report => report.target_ip));
                const targetsSearched = uniqueTargets.size;

                // Calculate vulnerable targets (targets with vulnerabilities > 0)
                const vulnerableTargetIPs = new Set();
                reports.forEach(report => {
                    if (report.total_vulnerabilities > 0) {
                        vulnerableTargetIPs.add(report.target_ip);
                    }
                });
                const vulnerableTargets = vulnerableTargetIPs.size;

                // Get most recent report date
                let recentReportDate = 'No reports yet';
                if (reports.length > 0) {
                    const sortedReports = reports.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
                    const mostRecentDate = new Date(sortedReports[0].generated_at);
                    recentReportDate = mostRecentDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });
                }

                // Generate recent activities from reports only
                const activities = reports
                    .sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at))
                    .slice(0, 3)
                    .map(report => ({
                        id: report.id,
                        type: report.total_vulnerabilities > 0 ? 'vulnerability_found' : 'scan_completed',
                        target: report.target_ip,
                        vulnerabilities: report.total_vulnerabilities,
                        timestamp: new Date(report.generated_at),
                        status: report.total_vulnerabilities > 0 ? 'warning' : 'success'
                    }));

                setDashboardStats({
                    targetsSearched,
                    vulnerableTargets,
                    recentReportDate
                });
                setRecentActivities(activities);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            setError('Network error: Unable to fetch dashboard data');
            console.error('Dashboard data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const howToSteps = [
        {
            step: 1,
            title: 'Select Target',
            description: 'Enter IP address to assess'
        },
        {
            step: 2,
            title: 'Network Scan',
            description: 'Discover running services'
        },
        {
            step: 3,
            title: 'Find Vulnerabilities',
            description: 'Analyze security weaknesses'
        },
        {
            step: 4,
            title: 'Generate Report',
            description: 'Get detailed PDF results'
        }
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'vulnerability_found':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'scan_completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getActivityDescription = (activity) => {
        switch (activity.type) {
            case 'vulnerability_found':
                return `Scan completed for ${activity.target}`;
            case 'scan_completed':
                return `Scan completed for ${activity.target}`;
            default:
                return 'Unknown activity';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
                                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20" />
                                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-32" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Error component
    const ErrorCard = () => (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105"
                            onClick={fetchDashboardData}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorCard />;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Targets Searched Card */}
                <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1 text-center">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Targets Searched
                            </h3>
                            <p className="text-3xl font-bold text-blue-600 mb-1">
                                {dashboardStats.targetsSearched}
                            </p>
                            <span className="text-xs text-gray-500 font-medium">
                                Unique IP addresses scanned
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Vulnerable Targets Card */}
                <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="flex-1 text-center">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Vulnerable Targets
                            </h3>
                            <p className="text-3xl font-bold text-red-600 mb-1">
                                {dashboardStats.vulnerableTargets}
                            </p>
                            <span className="text-xs text-gray-500 font-medium">
                                Targets with vulnerabilities
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Recent Report Card */}
                <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1 text-center">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Recent Report
                            </h3>
                            <p className="text-xl font-bold text-green-600 mb-1 font-mono">
                                {dashboardStats.recentReportDate}
                            </p>
                            <span className="text-xs text-gray-500 font-medium">
                                Last scan generated
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity and How-to-Use Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Section */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex-shrink-0 mt-1">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {getActivityDescription(activity)}
                                            </p>
                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                {formatTimeAgo(activity.timestamp)}
                                            </span>
                                        </div>
                                        {activity.vulnerabilities !== undefined && (
                                            <p className="text-xs text-gray-600">
                                                {activity.vulnerabilities > 0 
                                                    ? `${activity.vulnerabilities} vulnerabilities found`
                                                    : 'No vulnerabilities detected'
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No recent activity</p>
                                <p className="text-sm text-gray-400">Start your first assessment to see activity here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* How to Use Section - Modern Compact Design */}
                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md mb-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <Book className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Quick Guide</span>
                            </div>
                        </div>
                        
                        {/* Horizontal Steps Flow */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {howToSteps.map((step, index) => (
                                <div key={step.step} className="group relative">
                                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {step.step}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed ml-9">
                                            {step.description.length > 60 ? step.description.substring(0, 60) + '...' : step.description}
                                        </p>
                                    </div>
                                    
                                    {/* Arrow for flow - only show on larger screens */}
                                    {index === 1 && (
                                        <div className="hidden sm:block absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                            <ArrowRight className="w-4 h-4 text-blue-400 rotate-90" />
                                        </div>
                                    )}
                                    {index === 0 && (
                                        <div className="hidden sm:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                                            <ArrowRight className="w-4 h-4 text-blue-400" />
                                        </div>
                                    )}
                                    {index === 2 && (
                                        <div className="hidden sm:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                                            <ArrowRight className="w-4 h-4 text-blue-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="text-center">
                            <button 
                                onClick={() => navigate('/dashboard/vulnerability-assessment')}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
                            >
                                <Play className="w-4 h-4" />
                                Start Assessment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;