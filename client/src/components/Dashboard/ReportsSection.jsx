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
            return (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Clean
                </span>
            );
        } else if (vulnCount <= 5) {
            return (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-yellow-50 text-yellow-800 border-yellow-200">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Low ({vulnCount})
                </span>
            );
        } else if (vulnCount <= 15) {
            return (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-orange-50 text-orange-800 border-orange-200">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Medium ({vulnCount})
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-red-50 text-red-600 border-red-200">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    High ({vulnCount})
                </span>
            );
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
            <div className="p-3 w-full max-w-full box-border font-sans text-sm text-gray-800">
                <div className="flex justify-center items-center min-h-96">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 w-full max-w-full box-border font-sans text-sm text-gray-800">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-6 mb-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-gray-800 m-0 leading-tight">Security Reports</h1>
                    <p className="text-gray-500 m-0 text-lg leading-6">Manage and review your vulnerability assessment reports</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={fetchReports} 
                        className="flex items-center gap-2 px-7 py-3.5 border border-transparent rounded-xl font-medium cursor-pointer transition-all duration-200 text-base leading-none bg-gray-700 text-white border-gray-700 hover:bg-gray-800 hover:border-gray-800 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        <RefreshCcw className="w-4 h-4 flex-shrink-0" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search reports, IPs, or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base transition-all duration-200 bg-gray-50 focus:outline-none focus:border-gray-500 focus:shadow-sm focus:bg-white placeholder-gray-400"
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <select
                            value={filterConfig.vulnerabilityRange}
                            onChange={(e) => setFilterConfig(prev => ({...prev, vulnerabilityRange: e.target.value}))}
                            className="px-5 py-4 border border-gray-300 rounded-xl bg-gray-50 text-base cursor-pointer transition-all duration-200 min-w-40 text-gray-700 focus:outline-none focus:border-gray-500 focus:shadow-sm focus:bg-white hover:border-gray-400 hover:bg-white"
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
                            className="px-5 py-4 border border-gray-300 rounded-xl bg-gray-50 text-base cursor-pointer transition-all duration-200 min-w-40 text-gray-700 focus:outline-none focus:border-gray-500 focus:shadow-sm focus:bg-white hover:border-gray-400 hover:bg-white"
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
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 my-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-red-600 font-medium text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* Reports Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 my-4">
                {filteredAndSortedReports.length === 0 ? (
                    <div className="text-center py-20 px-8">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Reports Found</h3>
                        <p className="text-gray-500 text-lg leading-6">
                            {reports.length === 0 
                                ? "You haven't generated any reports yet." 
                                : "No reports match your current filters."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-auto">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-5 text-center font-semibold text-gray-700 border-0 whitespace-nowrap align-middle">
                                        <button onClick={() => handleSort('report_id')} className="flex items-center justify-center gap-2 bg-none border-0 cursor-pointer text-sm font-semibold text-gray-700 transition-colors duration-200 p-0 w-full text-center hover:text-gray-800">
                                            <span>Report ID</span>
                                            {sortConfig.key === 'report_id' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4 flex-shrink-0" /> : <SortDesc className="w-4 h-4 flex-shrink-0" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-center font-semibold text-gray-700 border-0 whitespace-nowrap align-middle">
                                        <button onClick={() => handleSort('target_ip')} className="flex items-center justify-center gap-2 bg-none border-0 cursor-pointer text-sm font-semibold text-gray-700 transition-colors duration-200 p-0 w-full text-center hover:text-gray-800">
                                            <span>Target IP</span>
                                            {sortConfig.key === 'target_ip' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4 flex-shrink-0" /> : <SortDesc className="w-4 h-4 flex-shrink-0" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-center font-semibold text-gray-700 border-0 whitespace-nowrap align-middle">
                                        <button onClick={() => handleSort('generated_at')} className="flex items-center justify-center gap-2 bg-none border-0 cursor-pointer text-sm font-semibold text-gray-700 transition-colors duration-200 p-0 w-full text-center hover:text-gray-800">
                                            <span>Generated At</span>
                                            {sortConfig.key === 'generated_at' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4 flex-shrink-0" /> : <SortDesc className="w-4 h-4 flex-shrink-0" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-center font-semibold text-gray-700 border-0 whitespace-nowrap align-middle">
                                        <button onClick={() => handleSort('total_vulnerabilities')} className="flex items-center justify-center gap-2 bg-none border-0 cursor-pointer text-sm font-semibold text-gray-700 transition-colors duration-200 p-0 w-full text-center hover:text-gray-800">
                                            <span>Vulnerabilities</span>
                                            {sortConfig.key === 'total_vulnerabilities' && (
                                                sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4 flex-shrink-0" /> : <SortDesc className="w-4 h-4 flex-shrink-0" />
                                            )}
                                        </button>
                                    </th>
                                    {reports.some(r => r.username) && (
                                        <th className="px-6 py-5 text-center font-semibold text-gray-700 border-0 whitespace-nowrap align-middle">
                                            <span>User</span>
                                        </th>
                                    )}
                                    <th className="px-6 py-5 text-center font-semibold text-gray-700 border-0 whitespace-nowrap align-middle">
                                        <span>Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {filteredAndSortedReports.map((report) => (
                                    <tr key={report.id} className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 last:border-0">
                                        <td className="px-6 py-5 align-middle text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
                                                <span className="text-sm font-medium text-gray-800 font-mono">{report.report_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-middle text-center">
                                            <span className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-medium inline-block">{report.target_ip}</span>
                                        </td>
                                        <td className="px-6 py-5 align-middle text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                {formatDate(report.generated_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-middle text-center">{getSeverityBadge(report.total_vulnerabilities)}</td>
                                        {report.username && (
                                            <td className="px-6 py-5 align-middle text-center">
                                                <span className="text-sm text-gray-500 font-medium">{report.username}</span>
                                            </td>
                                        )}
                                        <td className="px-6 py-5 align-middle text-center">
                                            <div className="flex gap-2 justify-center items-center">
                                                <button 
                                                    onClick={() => {
                                                        alert("Feature not available at the moment. We're working on it!");
                                                    }}
                                                    className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:text-gray-700 hover:border-gray-500"
                                                    title="View Report"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(report.report_id)} 
                                                    className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all duration-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:-translate-y-0.5 hover:text-red-700 hover:border-red-600"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                <div className="bg-white rounded-xl px-6 py-4 text-center text-gray-500 text-sm font-medium border border-gray-200 mt-4">
                    Showing {filteredAndSortedReports.length} of {reports.length} reports
                </div>
            )}
        </div>
    );
};

export default ReportsSection;