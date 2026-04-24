import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import './Analyze.css';

const CHART_COLORS = ['#8b5cf6', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];

function Analyze() {
    const { user } = useAuth();
    const cs = '₹';
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('monthly');
    const [chartType, setChartType] = useState('area'); // area, line, bar, pie
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, [loading]);

    // No longer need tablePage effect

    useEffect(() => {
        const fetchTransactions = async () => {
            if (user) {
                // For Analysis, we need a large dataset to build trends and charts over many months/years
                const data = await api.getTransactions(null, null, null, null, null, 0, 5000);
                if (data && data.content) {
                    setTransactions(data.content);
                }
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [user]);

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];
        const now = new Date();
        
        if (viewMode === 'yearly') {
            filtered = filtered.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
        } else if (viewMode === 'monthly') {
            filtered = filtered.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
        } else if (viewMode === 'daily') {
            filtered = filtered.filter(t => {
                const d = new Date(t.date);
                return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
        } else if (viewMode === 'custom' && customStartDate && customEndDate) {
            filtered = filtered.filter(t => {
                const d = new Date(t.date);
                return d >= customStartDate && d <= customEndDate;
            });
        }
        return filtered;
    }, [transactions, viewMode, customStartDate, customEndDate]);

    const getIcon = (categoryName) => {
        const iconMap = {
            'Housing': '🏠', 'Food & Dining': '🍔', 'Transportation': '🚗',
            'Entertainment': '🎮', 'Shopping': '🛍️', 'Salary': '💰', 'Investments': '📈'
        };
        return iconMap[categoryName] || '📋';
    };

    const getChartData = useCallback(() => {
        const dataMap = {};

        filteredTransactions.forEach(t => {
            const d = new Date(t.date);
            let key, label;

            if (viewMode === 'yearly') {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                label = d.toLocaleDateString('en-IN', { month: 'short' });
            } else if (viewMode === 'monthly') {
                key = d.toISOString().split('T')[0];
                label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            } else if (viewMode === 'daily') {
                key = `${d.toISOString().split('T')[0]}-${String(d.getHours()).padStart(2, '0')}`;
                label = `${String(d.getHours()).padStart(2, '0')}:00`;
            } else if (viewMode === 'custom') {
                key = d.toISOString().split('T')[0];
                label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            }

            if (!dataMap[key]) {
                dataMap[key] = { key, label, income: 0, expense: 0, transactions: [] };
            }
            if (t.type === 'income') dataMap[key].income += parseFloat(t.amount);
            else dataMap[key].expense += parseFloat(t.amount);
            dataMap[key].transactions.push(t);
        });

        return Object.keys(dataMap).sort().map(k => ({
            ...dataMap[k],
            net: dataMap[k].income - dataMap[k].expense
        }));
    }, [filteredTransactions, viewMode]);

    const chartData = getChartData();

    // Category data for pie chart
    const getCategoryData = useCallback(() => {
        const categoryMap = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            if (!categoryMap[t.category]) categoryMap[t.category] = 0;
            categoryMap[t.category] += parseFloat(Math.abs(t.amount));
        });
        return Object.keys(categoryMap).map((name, i) => ({
            id: i + 1, name, value: categoryMap[name], amount: categoryMap[name], color: CHART_COLORS[i % CHART_COLORS.length], icon: getIcon(name)
        })).sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const categoryData = getCategoryData();

    const totalIncome = chartData.reduce((s, d) => s + d.income, 0);
    const totalExpense = chartData.reduce((s, d) => s + d.expense, 0);
    const totalNet = totalIncome - totalExpense;

    const handleChartClick = (data) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const point = chartData.find(d => d.label === data.activeLabel);
            setSelectedPoint(point || null);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="analyze-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: '0.85rem' }}>
                            {p.name}: {cs}{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const total = categoryData.reduce((s, d) => s + d.value, 0);
            const pct = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="analyze-tooltip">
                    <p className="tooltip-label">{payload[0].name}</p>
                    <p style={{ color: payload[0].payload.color, fontWeight: 600, fontSize: '0.85rem' }}>
                        {cs}{Number(payload[0].value).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({pct}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // Common chart axis props
    const xAxisProps = { dataKey: "label", stroke: "rgba(255,255,255,0.3)", fontSize: 12, tickLine: false, axisLine: { stroke: 'rgba(255,255,255,0.08)' } };
    const yAxisProps = { stroke: "rgba(255,255,255,0.3)", fontSize: 12, tickLine: false, axisLine: false, tickFormatter: v => `${cs}${(v / 1000).toFixed(0)}k` };
    const gridProps = { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" };

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="empty-chart-analyze">
                    <p>No data available for this period. Try changing the filter.</p>
                </div>
            );
        }

        if (chartType === 'pie') {
            if (categoryData.length === 0) {
                return <div className="empty-chart-analyze"><p>No expense data for pie chart.</p></div>;
            }
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={110} outerRadius={170} paddingAngle={4} dataKey="value" animationDuration={1200}>
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '1.5rem', fontSize: '0.85rem', color: '#a1a1aa' }} />
                    </PieChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                        <CartesianGrid {...gridProps} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }} />
                        <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 7, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                        <CartesianGrid {...gridProps} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }} />
                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={chartData.length < 6 ? 40 : 20} />
                        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={chartData.length < 6 ? 40 : 20} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        // Default: area chart
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                    <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid {...gridProps} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expenseGrad)" dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
            </ResponsiveContainer>
        );
    };

    if (loading) {
        return <div className="analyze-container"><p style={{ color: 'white' }}>Loading analysis...</p></div>;
    }

    return (
        <div className="analyze-container" id="analyze-page">
            <header className="analyze-header">
                <div>
                    <h1 className="analyze-title">Financial <span className="text-gradient-accent">Analysis</span></h1>
                    <p className="analyze-subtitle">Visualize your spending patterns and trends</p>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="analyze-stats-row">
                <div className="analyze-stat-card">
                    <div className="stat-icon-wrap income-bg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    </div>
                    <div>
                        <p className="stat-label">Total Income</p>
                        <h3 className="stat-value income-text">{cs}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="analyze-stat-card">
                    <div className="stat-icon-wrap expense-bg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                    </div>
                    <div>
                        <p className="stat-label">Total Expenses</p>
                        <h3 className="stat-value expense-text">{cs}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="analyze-stat-card">
                    <div className={`stat-icon-wrap ${totalNet >= 0 ? 'income-bg' : 'expense-bg'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div>
                        <p className="stat-label">Net Balance</p>
                        <h3 className={`stat-value ${totalNet >= 0 ? 'income-text' : 'expense-text'}`}>{cs}{totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
            </div>

            {/* Main Chart Card */}
            <div className="analyze-chart-card">
                <div className="analyze-chart-header">
                    <h3 className="chart-title-analyze">
                        {chartType === 'pie' ? 'Category Distribution' : 'Income vs Expense Trend'}
                    </h3>
                    <div className="analyze-controls-row">
                        {/* Time Filters */}
                        <div className="analyze-filters">
                            {['yearly', 'monthly', 'daily', 'custom'].map(mode => (
                                <button
                                    key={mode}
                                    className={`analyze-filter-btn ${viewMode === mode ? 'active' : ''}`}
                                    onClick={() => { setViewMode(mode); setSelectedPoint(null); }}
                                    id={`filter-${mode}`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                        {/* Chart Type Switcher */}
                        <div className="chart-type-switcher">
                            {[
                                { type: 'area', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12H18L15 21L9 3L6 12H2" /></svg>, label: 'Area' },
                                { type: 'line', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>, label: 'Line' },
                                { type: 'bar', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="4" height="8" /><rect x="10" y="8" width="4" height="12" /><rect x="17" y="4" width="4" height="16" /></svg>, label: 'Bar' },
                                { type: 'pie', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>, label: 'Pie' }
                            ].map(ct => (
                                <button
                                    key={ct.type}
                                    className={`chart-type-btn ${chartType === ct.type ? 'active' : ''}`}
                                    onClick={() => setChartType(ct.type)}
                                    title={ct.label}
                                    id={`chart-type-${ct.type}`}
                                >
                                    {ct.icon}
                                    <span className="chart-type-label">{ct.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Range with DatePicker */}
                {viewMode === 'custom' && (
                    <div className="custom-range-row">
                        <div className="custom-range-field">
                            <label>From</label>
                            <DatePicker
                                selected={customStartDate}
                                onChange={date => setCustomStartDate(date)}
                                className="analyze-date-input"
                                dateFormat="dd MMM yyyy"
                                placeholderText="Start Date"
                                selectsStart
                                startDate={customStartDate}
                                endDate={customEndDate}
                                maxDate={customEndDate || new Date()}
                                isClearable
                            />
                        </div>
                        <div className="custom-range-field">
                            <label>To</label>
                            <DatePicker
                                selected={customEndDate}
                                onChange={date => setCustomEndDate(date)}
                                className="analyze-date-input"
                                dateFormat="dd MMM yyyy"
                                placeholderText="End Date"
                                selectsEnd
                                startDate={customStartDate}
                                endDate={customEndDate}
                                minDate={customStartDate}
                                maxDate={new Date()}
                                isClearable
                            />
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="analyze-chart-wrap" style={{ height: chartType === 'pie' ? '420px' : '380px' }}>
                    {renderChart()}
                </div>

                {/* Drill-down on click */}
                {selectedPoint && chartType !== 'pie' && (
                    <div className="drill-down-section" id="drill-down">
                        <div className="drill-down-header">
                            <h3 className="drill-down-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                Details for {selectedPoint.label}
                            </h3>
                            <button className="drill-close-btn" onClick={() => setSelectedPoint(null)}>✕</button>
                        </div>
                        <div className="drill-down-summary">
                            <span className="drill-income">Income: {cs}{selectedPoint.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span className="drill-expense">Expense: {cs}{selectedPoint.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span className={`drill-net ${selectedPoint.net >= 0 ? '' : 'negative'}`}>Net: {cs}{selectedPoint.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="drill-tx-list">
                            {selectedPoint.transactions.map((tx, i) => (
                                <div key={i} className="drill-tx-item">
                                    <div className="drill-tx-left">
                                        <span className={`drill-tx-type ${tx.type}`}>{tx.type === 'income' ? '↑' : '↓'}</span>
                                        <div>
                                            <p className="drill-tx-title">{tx.title}</p>
                                            <p className="drill-tx-cat">{tx.category} • {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <span className={`drill-tx-amount ${tx.type}`}>
                                        {tx.type === 'income' ? '+' : '-'}{cs}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {chartType === 'pie' && categoryData.length > 0 && (
                    <div className="category-list" style={{ marginTop: '2rem' }}>
                        <h3 className="chart-title-analyze" style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
                        {categoryData.map((cat) => {
                            const percentage = (cat.value / totalExpense) * 100;
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

            </div>
        </div>
    );
}

export default Analyze;
