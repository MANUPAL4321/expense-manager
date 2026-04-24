import { useState, useEffect } from 'react';
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

  const fetchSummary = async () => {
    const data = await api.getSummary();
    if (data) setSummary(data);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    const data = await api.getTransactions(null, null, null, null, null, 0, 5);
    if (data) {
      setPaginatedData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [user]);

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
        fetchTransactions();
        fetchSummary();
      }
    }
  };

  const displayedTransactions = paginatedData.content;

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

        {/* Recent Transactions */}
        <section className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Recent Transactions</h2>
            <Link to="/reports" className="tx-count-badge" style={{ textDecoration: 'none', cursor: 'pointer' }}>View All</Link>
          </div>

          <div className={`transaction-list ${loading ? 'loading-fade' : ''}`}>
            {displayedTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💸</div>
                <p className="empty-text">No transactions yet.</p>
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

              </>
            )}
          </div>
        </section>
      </div>
      <AgentChat onTransactionChange={() => { fetchTransactions(); fetchSummary(); }} />
    </>
  );
}

export default Dashboard;
