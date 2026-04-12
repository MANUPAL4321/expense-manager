import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Reports.css';

function Reports() {
    const { user } = useAuth();
    const cs = user?.currencySymbol || '$';
    const [animated, setAnimated] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tablePage, setTablePage] = useState(1);
    const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0 });
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            
            // Map UI filter to Backend filter type
            let apiFilter = null;
            if (timeFilter === 'daily') apiFilter = 'day';
            else if (timeFilter === 'monthly') apiFilter = 'month';
            else if (timeFilter === 'yearly') apiFilter = 'year';
            else if (timeFilter === 'range') apiFilter = 'range';

            // 1. Fetch filtered summary for metrics
            const summaryData = await api.getSummary(apiFilter, null, null, startDate || null, endDate || null);
            if (summaryData) setSummary(summaryData);

            // 2. Fetch filtered transactions for charts and table
            // We fetch a larger size (1000) so the charts and CSV download have full data for the period
            const data = await api.getTransactions(apiFilter, null, null, startDate || null, endDate || null, 0, 1000);
            if (data && data.content) {
                setTransactions(data.content);
            }
            setLoading(false);
            setTablePage(1); // Reset table page when filter changes
        };
        fetchData();
    }, [user, timeFilter, startDate, endDate]);

    const colors = ['#8b5cf6', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];
    const getIcon = (categoryName) => {
        const iconMap = {
            'Housing': '🏠', 'Food & Dining': '🍔', 'Transportation': '🚗',
            'Entertainment': '🎮', 'Shopping': '🛍️', 'Salary': '💰', 'Investments': '📈'
        };
        return iconMap[categoryName] || '📋';
    };

    // Since we now filter on the backend, we don't need local filtering logic
    // We just use the transactions returned for the period
    const filteredTransactions = transactions;
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

    const categoryMap = {};
    expenseTransactions.forEach(t => {
        if (!categoryMap[t.category]) categoryMap[t.category] = 0;
        categoryMap[t.category] += parseFloat(Math.abs(t.amount));
    });

    const categories = Object.keys(categoryMap).map((name, index) => ({
        id: index + 1, name, amount: categoryMap[name],
        icon: getIcon(name), color: colors[index % colors.length]
    })).sort((a, b) => b.amount - a.amount);

    const totalExpense = categories.reduce((sum, cat) => sum + cat.amount, 0);

    // Download report as CSV
    const handleDownloadReport = () => {
        const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString('en-IN'),
            t.title, t.category, t.type,
            `${t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}`
        ]);

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense_report_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="reports-container"><p style={{ color: 'white' }}>Loading reports...</p></div>;
    }

    return (
        <div className="reports-container" id="reports-page">
            <header className="reports-header">
                <div>
                    <h1 className="reports-title">Spending <span className="text-gradient">Insights</span></h1>
                    <p className="reports-subtitle">A detailed breakdown of your spending habits.</p>
                </div>
                <button className="download-btn" onClick={handleDownloadReport} id="download-report-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Report
                </button>
            </header>

            <div className="metrics-row">
                <div className="mini-metric">
                    <p className="mini-metric-label">Total Spent ({timeFilter})</p>
                    <h3 className="mini-metric-value">{cs}{Math.abs(summary.totalExpense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="mini-metric">
                    <p className="mini-metric-label">Total Income ({timeFilter})</p>
                    <h3 className="mini-metric-value">{cs}{summary.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="mini-metric">
                    <p className="mini-metric-label">Transactions Found</p>
                    <h3 className="mini-metric-value">{transactions.length}</h3>
                </div>
            </div>

            <div className="chart-card">
                <div className="chart-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 className="chart-title">Spending Analytics</h3>
                    <div className="filter-buttons">
                        <button className={`filter-btn ${timeFilter === 'daily' ? 'active' : ''}`} onClick={() => setTimeFilter('daily')}>Daily</button>
                        <button className={`filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`} onClick={() => setTimeFilter('monthly')}>Monthly</button>
                        <button className={`filter-btn ${timeFilter === 'yearly' ? 'active' : ''}`} onClick={() => setTimeFilter('yearly')}>Yearly</button>
                        <button className={`filter-btn ${timeFilter === 'range' ? 'active' : ''}`} onClick={() => setTimeFilter('range')}>Custom Range</button>
                    </div>
                </div>

                {timeFilter === 'range' && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <input type="date" className="filter-btn" value={startDate} onChange={e => { setStartDate(e.target.value); setTablePage(1); }} style={{ padding: '0.4rem', border: '1px solid var(--border-glass)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>to</span>
                        <input type="date" className="filter-btn" value={endDate} onChange={e => { setEndDate(e.target.value); setTablePage(1); }} style={{ padding: '0.4rem', border: '1px solid var(--border-glass)' }} />
                    </div>
                )}

                <div className="interactive-chart-container" style={{ height: '480px', width: '100%', marginBottom: '3rem' }}>
                    {categories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categories} cx="50%" cy="50%" innerRadius={100} outerRadius={150} paddingAngle={5} dataKey="amount" animationDuration={1500}>
                                    {categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${cs}${Number(value).toLocaleString('en-IN')} (${((value / totalExpense) * 100).toFixed(1)}%)`, name]}
                                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart"><p>No expenses recorded for this period.</p></div>
                    )}
                </div>

                <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>Category Breakdown</h3>
                {categories.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-glass-bright)' }}>
                        <p>No expense data available for this period.</p>
                    </div>
                ) : (
                    <div className="category-list">
                        {categories.map((cat) => {
                            const percentage = (cat.amount / totalExpense) * 100;
                            return (
                                <div key={cat.id} className="category-item">
                                    <div className="category-info">
                                        <div className="category-name-wrapper">
                                            <div className="category-icon">{cat.icon}</div>
                                            <span className="category-name">{cat.name}</span>
                                        </div>
                                        <span className="category-amount">{cs}{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: animated ? `${percentage}%` : '0%',
                                                backgroundColor: cat.color,
                                                boxShadow: `0 0 10px ${cat.color}80`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* All Transactions Table */}
                {filteredTransactions.length > 0 && (
                    <div className="report-table-section">
                        <h3 className="chart-title" style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>Transaction Details</h3>
                        <div className="report-table-wrap">
                            <table className="report-table" id="report-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions
                                        .slice((tablePage - 1) * ITEMS_PER_PAGE, tablePage * ITEMS_PER_PAGE)
                                        .map((tx, i) => (
                                        <tr key={i}>
                                            <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                                            <td>{tx.title}</td>
                                            <td>{tx.category}</td>
                                            <td>
                                                <span className={`report-type-badge ${tx.type}`}>{tx.type}</span>
                                            </td>
                                            <td className={tx.type === 'income' ? 'income-amount' : 'expense-amount'}>
                                                {tx.type === 'income' ? '+' : '-'}{tx.currencySymbol || cs}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredTransactions.length > ITEMS_PER_PAGE && (
                            <div className="pagination">
                                <button 
                                    className="page-btn" 
                                    onClick={() => setTablePage(prev => Math.max(prev - 1, 1))}
                                    disabled={tablePage === 1}
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {tablePage} of {Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)}
                                </span>
                                <button 
                                    className="page-btn" 
                                    onClick={() => setTablePage(prev => Math.min(prev + 1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)))}
                                    disabled={tablePage >= Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;
