import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Balance.css';

function Balance() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (user) {
                // For Balance page, we want a large set of transactions to calculate totals and monthly breakdown
                const data = await api.getTransactions(null, null, null, null, null, 0, 2000);
                if (data && data.content) {
                    setTransactions(data.content);
                }
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [user]);

    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalBalance = income - expenses;

    // Monthly breakdown
    const monthlyData = {};
    transactions.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        if (!monthlyData[key]) monthlyData[key] = { label, income: 0, expense: 0 };
        if (t.type === 'income') monthlyData[key].income += parseFloat(t.amount);
        else monthlyData[key].expense += parseFloat(t.amount);
    });

    const months = Object.keys(monthlyData).sort().reverse().map(k => ({
        ...monthlyData[k],
        key: k,
        balance: monthlyData[k].income - monthlyData[k].expense
    }));

    if (loading) {
        return <div className="balance-container"><p style={{ color: 'white' }}>Loading balance...</p></div>;
    }

    return (
        <div className="balance-container" id="balance-page">
            <header className="balance-header">
                <h1 className="balance-title">Your <span className="text-gradient-accent">Balance</span></h1>
                <p className="balance-subtitle">Complete overview of your financial health</p>
            </header>

            {/* Big Balance Card */}
            <div className="balance-hero-card">
                <div className="balance-hero-bg"></div>
                <div className="balance-hero-content">
                    <p className="balance-hero-label">Total Balance</p>
                    <h2 className={`balance-hero-amount ${totalBalance < 0 ? 'negative' : ''}`}>
                        ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h2>
                    <div className="balance-hero-stats">
                        <div className="balance-stat income">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>
                            <span>Income: ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="balance-stat expense">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline></svg>
                            <span>Expenses: ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown */}
            <section className="monthly-section">
                <h2 className="section-title-balance">Monthly Breakdown</h2>
                <div className="monthly-list">
                    {months.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No data yet.</p>
                    ) : (
                        months.map(m => (
                            <div key={m.key} className="monthly-row">
                                <div className="monthly-month">{m.label}</div>
                                <div className="monthly-details">
                                    <span className="monthly-income">+₹{m.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    <span className="monthly-expense">-₹{m.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    <span className={`monthly-balance ${m.balance < 0 ? 'negative' : ''}`}>
                                        ₹{m.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default Balance;
