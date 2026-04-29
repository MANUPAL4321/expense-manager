import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import './History.css';
import './Analyze.css';
import './Dashboard.css';

function History() {
    const { user } = useAuth();
    const cs = '₹';
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering state
    const [viewMode, setViewMode] = useState('monthly');
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    
    const [tablePage, setTablePage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        setTablePage(1);
    }, [viewMode, customStartDate, customEndDate, searchTerm, typeFilter]);

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchTransactions = async () => {
        if (user) {
            setLoading(true);
            const data = await api.getTransactions(null, null, null, null, null, 0, 5000);
            if (data && data.content) {
                setTransactions(data.content);
            }
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            const res = await api.deleteTransaction(id);
            if (res.success) {
                fetchTransactions();
            }
        }
    };

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

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(lowerSearch) || 
                t.category.toLowerCase().includes(lowerSearch)
            );
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        return filtered;
    }, [transactions, viewMode, customStartDate, customEndDate, searchTerm, typeFilter]);

    const paginatedTransactions = useMemo(() => {
        return filteredTransactions.slice((tablePage - 1) * ITEMS_PER_PAGE, tablePage * ITEMS_PER_PAGE);
    }, [filteredTransactions, tablePage]);

    const groupedTransactions = useMemo(() => {
        const groups = {};
        paginatedTransactions.forEach(tx => {
            const dateObj = new Date(tx.date);
            const dateStr = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).toUpperCase();
            
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(tx);
        });
        return groups;
    }, [paginatedTransactions]);

    const getIcon = (type) => type === 'income' ? '💼' : '🛒';

    if (loading && transactions.length === 0) {
        return <div className="history-container"><p style={{ color: 'white' }}>Loading history...</p></div>;
    }

    return (
        <div className="history-container" id="history-page">
            <header className="analyze-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="analyze-title">Transaction <span className="text-gradient-accent">History</span></h1>
                    <p className="analyze-subtitle" style={{ marginTop: '0.5rem' }}>Browse and search all your past transactions</p>
                </div>
            </header>

            <div className="analyze-chart-card">
                <div className="analyze-chart-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 className="chart-title-analyze">Filter Records</h3>
                        <div className="analyze-controls-row">
                            <div className="analyze-filters">
                                {['yearly', 'monthly', 'daily', 'custom'].map(mode => (
                                    <button
                                        key={mode}
                                        className={`analyze-filter-btn ${viewMode === mode ? 'active' : ''}`}
                                        onClick={() => setViewMode(mode)}
                                        id={`history-filter-${mode}`}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="search-filter-bar" style={{ marginTop: '0.5rem', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="search-input-wrap" style={{ flex: 1, minWidth: '250px' }}>
                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search by title or category..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>
                        
                        <div className="filter-chips">
                            <button className={`filter-chip ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>All Types</button>
                            <button className={`filter-chip income ${typeFilter === 'income' ? 'active' : ''}`} onClick={() => setTypeFilter('income')}>Income</button>
                            <button className={`filter-chip expense ${typeFilter === 'expense' ? 'active' : ''}`} onClick={() => setTypeFilter('expense')}>Expense</button>
                        </div>
                    </div>
                </div>

                {viewMode === 'custom' && (
                    <div className="custom-range-row" style={{ marginTop: '1.5rem' }}>
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

                <div className="report-table-section" style={{ marginTop: '1.5rem' }}>
                    <div className="transaction-list">
                        {filteredTransactions.length === 0 ? (
                            <div className="empty-chart-analyze" style={{ padding: '3rem' }}>
                                <p>No transactions found for this filter.</p>
                            </div>
                        ) : (
                            Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a)).map(dateGroup => (
                                <div key={dateGroup} className="date-group" style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', paddingLeft: '0.5rem', letterSpacing: '0.05em', fontWeight: 600 }}>{dateGroup}</h4>
                                    <div className="transaction-list">
                                        {groupedTransactions[dateGroup].map(tx => (
                                            <div key={tx.id} className="transaction-item">
                                                <div className="tx-left">
                                                    <div className="tx-icon-base" style={{
                                                        background: tx.type === 'income' ? 'var(--color-income-glow)' : 'var(--bg-glass-hover)',
                                                        border: tx.type === 'income' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-glass)'
                                                    }}>
                                                        <span style={{ fontSize: '1.2rem' }}>{tx.icon || getIcon(tx.type)}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="tx-title">{tx.title}</h4>
                                                        <p className="tx-category">{tx.category} • <span className={`tx-type-tag ${tx.type}`}>{tx.type}</span></p>
                                                    </div>
                                                </div>
                                                <div className="tx-right">
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                                                        <span className="tx-amount" style={{
                                                            color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'
                                                        }}>
                                                            {tx.type === 'income' ? '+' : '-'}{cs}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="tx-actions">
                                                        <button onClick={() => navigate('/add', { state: { transaction: tx } })} className="tx-action-btn edit" title="Edit">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(tx.id)} className="tx-action-btn delete" title="Delete">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
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
            </div>
        </div>
    );
}

export default History;
