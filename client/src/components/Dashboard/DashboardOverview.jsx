import React, { useState, useEffect } from 'react';
import { Network, Shield, FileText, Target, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './../css/TesterDashboard.css';

const DashboardOverview = () => {
    const navigate = useNavigate();
    const [dashboardStats, setDashboardStats] = useState({
        targetsSearched: 0,
        vulnerableTargets: 0,
        recentReportDate: 'No reports yet'
    });
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
                        month: 'long',      // "June" instead of "06"
                        year: 'numeric'
                    });
                }

                setDashboardStats({
                    targetsSearched,
                    vulnerableTargets,
                    recentReportDate
                });
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

    if (loading) {
        return (
            <div className="dashboard-stats">
                {[1, 2, 3].map(i => (
                    <div key={i} className="stat-card loading-card">
                        <div className="loading-skeleton-icon"></div>
                        <div>
                            <div className="loading-skeleton-text"></div>
                            <div className="loading-skeleton-number"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-stats">
                <div className="stat-card error-card">
                    <AlertTriangle className="stat-icon text-red-600" size={40} />
                    <div>
                        <h3>Error</h3>
                        <p className="error-text">{error}</p>
                        <button 
                            className="retry-button"
                            onClick={fetchDashboardData}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-stats">
            <div className="stat-card targets-searched-card">
                <Target className="stat-icon text-blue-600" size={40} />
                <div>
                    <h3>Targets Searched</h3>
                    <p className="stat-number">{dashboardStats.targetsSearched}</p>
                    <span className="stat-subtitle">Unique IP addresses scanned</span>
                </div>
            </div>
            
            <div className="stat-card vulnerable-targets-card">
                <Shield className="stat-icon text-red-600" size={40} />
                <div>
                    <h3>Vulnerable Targets</h3>
                    <p className="stat-number text-red-600">{dashboardStats.vulnerableTargets}</p>
                    <span className="stat-subtitle">Targets with vulnerabilities</span>
                </div>
            </div>
            
            <div className="stat-card recent-report-card">
                <FileText className="stat-icon text-green-600" size={40} />
                <div>
                    <h3>Recent Report</h3>
                    <p className="stat-number stat-date">{dashboardStats.recentReportDate}</p>
                    <span className="stat-subtitle">Last scan generated</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;