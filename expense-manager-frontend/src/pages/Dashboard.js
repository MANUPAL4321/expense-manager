import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AgentChat from '../components/AgentChat';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cs = user?.currencySymbol || '$';

  // Data state
  const [paginatedData, setPaginatedData] = useState({ content: [], totalPages: 0, totalElements: 0, pageNumber: 0 });
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(true);

  // Filter state
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchSummary = async () => {
    const data = await api.getSummary();
    if (data) setSummary(data);
  };

  const fetchTransactions = async (page = 0) => {
    if (!user) return;
    setLoading(true);

    let apiFilterType = null;
    let startDate = null;
    let endDate = null;

    if (filterDate) {
      apiFilterType = 'range';
      startDate = filterDate;
      endDate = filterDate;
    }

    const data = await api.getTransactions(apiFilterType, null, null, startDate, endDate, page, 10);
    if (data) {
      setPaginatedData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions(currentPage);
    fetchSummary();
  }, [user, currentPage, filterDate]);

  // When filter settings change (except page), reset to page 0
  useEffect(() => {
    setCurrentPage(0);
  }, [filterDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < paginatedData.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false
    });
    const hour = parseInt(currentHour, 10);
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getIcon = (type) => type === 'income' ? '💼' : '🛒';

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const res = await api.deleteTransaction(id);
      if (res.success) {
        fetchTransactions(currentPage);
        fetchSummary();
      }
    }
  };

  // We still allow a small search filter on the client-side for the current page contents for snappiness
  const displayedTransactions = useMemo(() => {
    let result = [...paginatedData.content];
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [paginatedData.content, filterType, searchQuery]);

  if (loading && paginatedData.content.length === 0) {
    return <div className="dashboard-container"><p style={{ color: 'white' }}>Loading dashboard...</p></div>;
  }

  return (
    <>
      <div className="dashboard-container" id="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1 className="greeting">{getGreeting()}, <span className="text-gradient">{user?.username}</span></h1>
            <p className="subtitle">Here's what's happening with your money today.</p>
          </div>
          <Link to="/add" className="primary-button" id="add-transaction-btn">
            <span className="button-icon">+</span> Add Transaction
          </Link>
        </header>

        {/* Quick Balance Overview */}
        <section className="summary-grid">
          <div className="master-card">
            <div className="master-card-bg"></div>
            <div className="master-card-content">
              <div>
                <p className="master-card-label">Total Balance</p>
                <h2 className="master-card-amount">{cs}{summary.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="master-card-chip"></div>
            </div>
          </div>

          <div className="metrics-column">
            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'var(--color-income-glow)', color: 'var(--color-income)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              </div>
              <div>
                <p className="metric-label">Total Income</p>
                <h3 className="metric-amount">{cs}{summary.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'var(--color-expense-glow)', color: 'var(--color-expense)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              </div>
              <div>
                <p className="metric-label">Total Expense</p>
                <h3 className="metric-amount">{cs}{summary.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Transaction History with Search */}
        <section className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Transactions List</h2>
            <span className="tx-count-badge">Total: {paginatedData.totalElements} items</span>
          </div>

          {/* Search & Filter Bar */}
          <div className="search-filter-bar" id="search-bar">
            <div className="search-input-wrap">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search on this page..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                id="search-input"
              />
            </div>
            <div className="filter-chips">
              <button className={`filter-chip ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>All</button>
              <button className={`filter-chip income ${filterType === 'income' ? 'active' : ''}`} onClick={() => setFilterType('income')}>Income</button>
              <button className={`filter-chip expense ${filterType === 'expense' ? 'active' : ''}`} onClick={() => setFilterType('expense')}>Expense</button>
              <input
                type="date"
                className="filter-date-input"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                title="Filter by date (Server-side)"
              />
              {filterDate && (
                <button className="filter-chip" onClick={() => setFilterDate('')} style={{ fontSize: '0.75rem' }}>Clear Date</button>
              )}
            </div>
          </div>

          <div className={`transaction-list ${loading ? 'loading-fade' : ''}`}>
            {displayedTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p className="empty-text">No transactions found for these filters.</p>
              </div>
            ) : (
              <>
                {displayedTransactions.map(tx => (
                  <div key={tx.id} className="transaction-item" id={`tx-${tx.id}`}>
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
                          {tx.type === 'income' ? '+' : '-'}{tx.currencySymbol || cs}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="tx-date">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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

                {/* Pagination Controls */}
                <div className="pagination-wrapper">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                      // Simple pagination logic to show max 5 pages around current
                      let pageIdx = i;
                      if (paginatedData.totalPages > 5) {
                        if (currentPage > 2) pageIdx = currentPage - 2 + i;
                        if (pageIdx >= paginatedData.totalPages) pageIdx = paginatedData.totalPages - 5 + i;
                      }
                      if (pageIdx < 0) return null;
                      if (pageIdx >= paginatedData.totalPages) return null;

                      return (
                        <button
                          key={pageIdx}
                          className={`page-number ${currentPage === pageIdx ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageIdx)}
                        >
                          {pageIdx + 1}
                        </button>
                      );
                    })}
                    {paginatedData.totalPages > 5 && currentPage < paginatedData.totalPages - 3 && <span>...</span>}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={currentPage >= paginatedData.totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <AgentChat onTransactionChange={() => { fetchTransactions(currentPage); fetchSummary(); }} />
    </>
  );
}

export default Dashboard;
