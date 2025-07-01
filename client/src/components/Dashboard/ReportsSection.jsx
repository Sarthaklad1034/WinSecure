import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, 
    SortAsc, 
    SortDesc, 
    Calendar, 
    FileText, 
    Trash2,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCcw
} from 'lucide-react';
import './../css/ReportSection.css';

const ReportsSection = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'generated_at', direction: 'desc' });
    const [filterConfig, setFilterConfig] = useState({
        vulnerabilityRange: 'all',
        dateRange: 'all'
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch('/reports', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                setReports(data.reports || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch reports');
            }
        } catch (err) {
            setError('Network error: Unable to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            const response = await fetch(`/reports/${reportId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                setReports(prev => prev.filter(report => report.report_id !== reportId));
            } else {
                alert(data.message || 'Failed to delete report');
            }
        } catch (err) {
            alert('Network error: Unable to delete report');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedReports = useMemo(() => {
        let filtered = reports.filter(report => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                report.report_id.toLowerCase().includes(searchLower) ||
                report.target_ip.toLowerCase().includes(searchLower) ||
                (report.username && report.username.toLowerCase().includes(searchLower));

            let matchesVulnRange = true;
            if (filterConfig.vulnerabilityRange !== 'all') {
                const vulnCount = report.total_vulnerabilities;
                switch (filterConfig.vulnerabilityRange) {
                    case 'none':
                        matchesVulnRange = vulnCount === 0;
                        break;
                    case 'low':
                        matchesVulnRange = vulnCount > 0 && vulnCount <= 5;
                        break;
                    case 'medium':
                        matchesVulnRange = vulnCount > 5 && vulnCount <= 15;
                        break;
                    case 'high':
                        matchesVulnRange = vulnCount > 15;
                        break;
                }
            }

            let matchesDateRange = true;
            if (filterConfig.dateRange !== 'all') {
                const reportDate = new Date(report.generated_at);
                const now = new Date();
                const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
                switch (filterConfig.dateRange) {
                    case 'today':
                        matchesDateRange = daysDiff === 0;
                        break;
                    case 'week':
                        matchesDateRange = daysDiff <= 7;
                        break;
                    case 'month':
                        matchesDateRange = daysDiff <= 30;
                        break;
                    case 'year':
                        matchesDateRange = daysDiff <= 365;
                        break;
                }
            }

            return matchesSearch && matchesVulnRange && matchesDateRange;
        });

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'generated_at') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [reports, searchTerm, sortConfig, filterConfig]);

    const getSeverityBadge = (vulnCount) => {
        if (vulnCount === 0) {
            return <span className="severity-badge severity-clean"><CheckCircle className="severity-icon" />Clean</span>;
        } else if (vulnCount <= 5) {
            return <span className="severity-badge severity-low"><AlertTriangle className="severity-icon" />Low ({vulnCount})</span>;
        } else if (vulnCount <= 15) {
            return <span className="severity-badge severity-medium"><AlertTriangle className="severity-icon" />Medium ({vulnCount})</span>;
        } else {
            return <span className="severity-badge severity-high"><XCircle className="severity-icon" />High ({vulnCount})</span>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="reports-section">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-section">
            {/* Header */}
            <div className="section-header">
                <div className="header-content">
                    <h1 className="section-title">Security Reports</h1>
                    <p className="section-description">Manage and review your vulnerability assessment reports</p>
                </div>
                <div className="header-actions">
                    <button onClick={fetchReports} className="btn btn-primary">
                        <RefreshCcw className="btn-icon" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-panel">
                <div className="controls-content">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search reports, IPs, or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filters-container">
                        <select
                            value={filterConfig.vulnerabilityRange}
                            onChange={(e) => setFilterConfig(prev => ({...prev, vulnerabilityRange: e.target.value}))}
                            className="filter-select"
                        >
                            <option value="all">All Severity</option>
                            <option value="none">Clean (0)</option>
                            <option value="low">Low (1–5)</option>
                            <option value="medium">Medium (6–15)</option>
                            <option value="high">High (16+)</option>
                        </select>

                        <select
                            value={filterConfig.dateRange}
                            onChange={(e) => setFilterConfig(prev => ({...prev, dateRange: e.target.value}))}
                            className="filter-select"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="error-banner">
                    <div className="error-content">
                        <XCircle className="error-icon" />
                        <span className="error-text">{error}</span>
                    </div>
                </div>
            )}

            {/* Reports Table */}
            <div className="reports-table-container">
                {filteredAndSortedReports.length === 0 ? (
                    <div className="empty-state">
                        <FileText className="empty-icon" />
                        <h3 className="empty-title">No Reports Found</h3>
                        <p className="empty-description">
                            {reports.length === 0 
                                ? "You haven't generated any reports yet." 
                                : "No reports match your current filters."}
                        </p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="reports-table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-th">
                                        <button onClick={() => handleSort('report_id')} className="sort-button">
                                            <span>Report ID</span>
                                            {sortConfig.key === 'report_id' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="sort-icon" /> : <SortDesc className="sort-icon" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="table-th">
                                        <button onClick={() => handleSort('target_ip')} className="sort-button">
                                            <span>Target IP</span>
                                            {sortConfig.key === 'target_ip' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="sort-icon" /> : <SortDesc className="sort-icon" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="table-th">
                                        <button onClick={() => handleSort('generated_at')} className="sort-button">
                                            <span>Generated At</span>
                                            {sortConfig.key === 'generated_at' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="sort-icon" /> : <SortDesc className="sort-icon" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="table-th">
                                        <button onClick={() => handleSort('total_vulnerabilities')} className="sort-button">
                                            <span>Vulnerabilities</span>
                                            {sortConfig.key === 'total_vulnerabilities' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="sort-icon" /> : <SortDesc className="sort-icon" />
                                            )}
                                        </button>
                                    </th>
                                    {reports.some(r => r.username) && (
                                        <th className="table-th"><span>User</span></th>
                                    )}
                                    <th className="table-th table-th-right"><span>Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredAndSortedReports.map((report) => (
                                    <tr key={report.id} className="table-row">
                                        <td className="table-td">
                                            <div className="table-cell-content">
                                                <FileText className="table-icon" />
                                                <span className="report-id">{report.report_id}</span>
                                            </div>
                                        </td>
                                        <td className="table-td">
                                            <span className="ip-badge">{report.target_ip}</span>
                                        </td>
                                        <td className="table-td">
                                            <div className="date-content">
                                                <Calendar className="date-icon" />
                                                {formatDate(report.generated_at)}
                                            </div>
                                        </td>
                                        <td className="table-td">{getSeverityBadge(report.total_vulnerabilities)}</td>
                                        {report.username && (
                                            <td className="table-td">
                                                <span>{report.username}</span>
                                            </td>
                                        )}
                                        <td className="table-td table-td-right">
                                            <div className="action-buttons">
                                                <button onClick={() => {
                                                    // Temporarily disabled
                                                    alert("Feature not available at the moment. We're working on it!");
                                                    // window.open(`/reports/${report.report_id}`, '_blank'); // Keep this commented for future
                                                }}
                                                className="action-btn action-btn-view" title="View Report">
                                                    <Eye className="action-icon" />
                                                </button>
                                                <button onClick={() => handleDelete(report.report_id)} className="action-btn action-btn-delete" title="Delete Report">
                                                    <Trash2 className="action-icon" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            {filteredAndSortedReports.length > 0 && (
                <div className="results-summary">
                    Showing {filteredAndSortedReports.length} of {reports.length} reports
                </div>
            )}
        </div>
    );
};

export default ReportsSection;
