import React, { useState, useEffect } from 'react';
import {
    FaCalendarAlt, FaMoneyBillWave, FaFileInvoiceDollar, FaChartLine,
    FaSearch, FaFileCsv, FaFilter, FaSpinner
} from 'react-icons/fa';

const ResFinance = () => {
    const [isLoading, setIsLoading] = useState({
        summary: false,
        history: false
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAmount, setFilterAmount] = useState('all');

    const [error, setError] = useState({
        summary: null,
        salary: null,
        history: null
    });

    const [summaryData, setSummaryData] = useState({
        totalSalary: 0,
        basicSalary: 0,
        allowances: 0,
        netSalary: 0
    });

    const [salaryHistory, setSalaryHistory] = useState([]);

    // Fetch summary data
    useEffect(() => {
        setIsLoading(prev => ({ ...prev, summary: true }));
        fetch('/api/salary/summary')
            .then(res => res.json())
            .then(data => {
                setSummaryData(data || {});
                setIsLoading(prev => ({ ...prev, summary: false }));
            })
            .catch(() => {
                setError(prev => ({ ...prev, summary: 'Error loading summary data' }));
                setIsLoading(prev => ({ ...prev, summary: false }));
            });
    }, [filterPeriod]);

    // Fetch salary history
    useEffect(() => {
        setIsLoading(prev => ({ ...prev, history: true }));
        fetch('/api/salary/history')
            .then(res => res.json())
            .then(data => {
                setSalaryHistory(data || []);
                setIsLoading(prev => ({ ...prev, history: false }));
            })
            .catch(() => {
                setError(prev => ({ ...prev, history: 'Error loading salary history' }));
                setIsLoading(prev => ({ ...prev, history: false }));
            });
    }, []);

    const filteredHistory = salaryHistory.filter(record => {
        if (isLoading.history || !record) return false;

        const matchesSearch = !searchQuery ||
            record.month.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

        let matchesAmount = true;
        if (filterAmount === 'less4000') {
            matchesAmount = record.amount < 4000;
        } else if (filterAmount === '4000to6000') {
            matchesAmount = record.amount >= 4000 && record.amount <= 6000;
        } else if (filterAmount === 'above6000') {
            matchesAmount = record.amount > 6000;
        }

        return matchesSearch && matchesStatus && matchesAmount;
    });

    const exportCSV = () => {
        const csvRows = [
            ['Month', 'Date', 'Amount', 'Status'],
            ...salaryHistory.map(record => [
                record.month,
                new Date(record.date).toLocaleDateString(),
                record.amount,
                record.status
            ])
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'salary_history.csv';
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="finance-container">
            <div className="data2">
                <div className='title2' style={{ paddingTop: "0" }}>
                    <p style={{marginTop:"10px"}}>Salary Overview</p>
                </div>
                <hr id="split" />
            </div>

            <div className="finance-header">
                <div className="header-actions">
                    <div className="period-selector">
                        <FaCalendarAlt className="selector-icon" />
                        <select
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                            className="period-select"
                        >
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <button className="export-btn" onClick={exportCSV}>
                        <FaFileCsv /> Export
                    </button>
                </div>
            </div>

            <div className="finance-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Salary History
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="finance-overview">
                    <div className="summary-cards">
                        <div className="summary-card total-earnings">
                            <div className="card-icon">
                                <FaMoneyBillWave />
                            </div>
                            <div className="card-content">
                                <h3>Total Salary</h3>
                                {isLoading.summary ? (
                                    <div className="loading-indicator"><FaSpinner className="spinner" /></div>
                                ) : (
                                    <>
                                        <p className="amount">{summaryData.totalSalary.toLocaleString()} EGP</p>
                                        <p className="period">{filterPeriod === 'month' ? 'This Month' : filterPeriod === 'year' ? 'This Year' : 'Selected Period'}</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="summary-card pending">
                            <div className="card-icon">
                                <FaFileInvoiceDollar />
                            </div>
                            <div className="card-content">
                                <h3>Basic Salary</h3>
                                {isLoading.summary ? (
                                    <div className="loading-indicator"><FaSpinner className="spinner" /></div>
                                ) : (
                                    <>
                                        <p className="amount">{summaryData.basicSalary.toLocaleString()} EGP</p>
                                        <p className="count">Monthly Base</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="summary-card completed">
                            <div className="card-icon">
                                <FaFileInvoiceDollar />
                            </div>
                            <div className="card-content">
                                <h3>Allowances</h3>
                                {isLoading.summary ? (
                                    <div className="loading-indicator"><FaSpinner className="spinner" /></div>
                                ) : (
                                    <>
                                        <p className="amount">{summaryData.allowances.toLocaleString()} EGP</p>
                                        <p className="count">Additional Benefits</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="summary-card average">
                            <div className="card-icon">
                                <FaChartLine />
                            </div>
                            <div className="card-content">
                                <h3>Net Salary</h3>
                                {isLoading.summary ? (
                                    <div className="loading-indicator"><FaSpinner className="spinner" /></div>
                                ) : (
                                    <>
                                        <p className="amount">{summaryData.netSalary.toLocaleString()} EGP</p>
                                        <p className="count">After Deductions</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="recent-payments">
                        <div className="section-header">
                            <h2>Recent Salary Payments</h2>
                            <button 
                                className="view-all-btn"
                                onClick={() => setActiveTab('history')}
                            >
                                View All
                            </button>
                        </div>
                        <div className="table-container">
                            {isLoading.history ? (
                                <div className="loading-table">
                                    <FaSpinner className="spinner" />
                                    <p>Loading salary data...</p>
                                </div>
                            ) : error.history ? (
                                <div className="error-message">{error.history}</div>
                            ) : (
                                <table className="payments-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaryHistory.length > 0 ? (
                                            salaryHistory.slice(0, 5).map((record, index) => (
                                                <tr key={index}>
                                                    <td>{record.month}</td>
                                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                                    <td>{record.amount.toLocaleString()} EGP</td>
                                                    <td>
                                                        <span className={`status-badge ${record.status}`}>
                                                            {record.status === 'Paid' ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="no-results">No salary records available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Salary History Tab */}
            {activeTab === 'history' && (
                <div className="payments-history">
                    <div className="filter-section">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by month..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                            <FaFilter /> Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="advanced-filters">
                            <div className="filter-group">
                                <label>Payment Status:</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Amount Range:</label>
                                <select value={filterAmount} onChange={(e) => setFilterAmount(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="less4000">Less than 4000 EGP</option>
                                    <option value="4000to6000">4000 - 6000 EGP</option>
                                    <option value="above6000">Above 6000 EGP</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {isLoading.history ? (
                            <div className="loading-table"><FaSpinner className="spinner" /> <p>Loading salary history...</p></div>
                        ) : error.history ? (
                            <div className="error-message">{error.history}</div>
                        ) : (
                            <table className="payments-table full">
                                <thead>
                                    <tr><th>Month</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.length > 0 ? (
                                        filteredHistory.map((record, index) => (
                                            <tr key={index}>
                                                <td>{record.month}</td>
                                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                                <td>{record.amount.toLocaleString()} EGP</td>
                                                <td><span className={`status-badge ${record.status}`}>{record.status}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="no-results">No salary records matching your filters</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResFinance;
