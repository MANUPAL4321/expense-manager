import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './History.css';
import './Analyze.css';

function History() {
    const { user } = useAuth();
    const cs = '₹';
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering state
    const [viewMode, setViewMode] = useState('monthly');
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [tablePage, setTablePage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        setTablePage(1);
    }, [viewMode, customStartDate, customEndDate]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (user) {
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

    const handleDownloadReport = () => {
        const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
        const rows = filteredTransactions.map(t => {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            return [
                dateStr,
                `"${t.title.replace(/"/g, '""')}"`,
                t.category,
                t.type,
                `${t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}`
            ];
        });

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        // Add BOM so Excel automatically recognizes UTF-8, and change MIME type slightly
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense_history_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Append to body before click for cross-browser compatibility (prevents downloading current HTML page)
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="history-container"><p style={{ color: 'white' }}>Loading history...</p></div>;
    }

    return (
        <div className="history-container" id="history-page">
            <header className="analyze-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="analyze-title">Transaction <span className="text-gradient-accent">History</span></h1>
                    <p className="analyze-subtitle" style={{ marginTop: '0.5rem' }}>View and filter all your past transactions</p>
                </div>
                <button className="download-btn" onClick={handleDownloadReport} id="download-report-btn" style={{ alignSelf: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export CSV
                </button>
            </header>

            <div className="analyze-chart-card">
                <div className="analyze-chart-header">
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

                <div className="report-table-section" style={{ marginTop: '0' }}>
                    <div className="report-table-wrap">
                        {filteredTransactions.length === 0 ? (
                            <div className="empty-chart-analyze">
                                <p>No transactions found for this period.</p>
                            </div>
                        ) : (
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
                                                {tx.type === 'income' ? '+' : '-'}{cs}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
