import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

function LogoIcon({ size = 28 }) {
    return (
        <div className="logo-icon-wrap" style={{ width: size + 8, height: size + 8 }}>
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        </div>
    );
}

function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="landing-container">
            {/* Navigation Bar */}
            <nav className="landing-nav">
                <div className="logo">
                    <LogoIcon size={28} />
                    <span className="logo-text">Expense<span className="accent">Manager</span></span>
                </div>
                <div className="nav-actions">
                    <button onClick={() => navigate('/login')} className="nav-btn-text">Login</button>
                    <button onClick={() => navigate('/login', { state: { mode: 'register' } })} className="nav-btn-primary">Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <div className="badge">New: AI Powered Analytics ✨</div>
                    <h1 className="hero-title">
                        Master Your Money with <br />
                        <span className="text-gradient-accent">Next-Gen Intelligence</span>
                    </h1>
                    <p className="hero-description">
                        Take full control of your finances with ExpenseManager. Track, analyze, and optimize 
                        your spending habits with our premium glass-designed dashboard.
                    </p>
                    <div className="hero-btns">
                        <button onClick={() => navigate('/login', { state: { mode: 'register' } })} className="primary-button-lg">Start Free Trial</button>
                        <button onClick={() => navigate('/login')} className="secondary-button-lg">View Demo</button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-value">10k+</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">4.9/5</span>
                            <span className="stat-label">User Rating</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">$1M+</span>
                            <span className="stat-label">Tracked Monthly</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="dashboard-preview">
                        <div className="preview-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="preview-content">
                            {/* Greeting */}
                            <p className="preview-greeting">Good morning, <span>John</span></p>

                            {/* Summary cards */}
                            <div className="preview-cards">
                                <div className="preview-card preview-card--balance">
                                    <span className="preview-card-label">Total Balance</span>
                                    <span className="preview-card-value">$12,580.50</span>
                                    <span className="preview-card-change preview-card-change--up">↑ 12.5%</span>
                                </div>
                                <div className="preview-card">
                                    <span className="preview-card-label">Income</span>
                                    <span className="preview-card-value preview-card-value--income">$8,450.00</span>
                                </div>
                                <div className="preview-card">
                                    <span className="preview-card-label">Expense</span>
                                    <span className="preview-card-value preview-card-value--expense">$3,120.45</span>
                                </div>
                            </div>

                            {/* Mini bar chart */}
                            <div className="preview-chart">
                                <div className="preview-chart-header">
                                    <span className="preview-chart-title">Weekly Overview</span>
                                    <span className="preview-chart-period">This Week</span>
                                </div>
                                <div className="preview-chart-bars">
                                    {[65, 40, 85, 55, 70, 90, 45].map((h, i) => (
                                        <div key={i} className="preview-bar-col">
                                            <div className="preview-bar" style={{ height: `${h}%` }} />
                                            <span className="preview-bar-label">{['M','T','W','T','F','S','S'][i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent transactions */}
                            <div className="preview-transactions">
                                <div className="preview-tx">
                                    <div className="preview-tx-icon preview-tx-icon--food">🍕</div>
                                    <div className="preview-tx-info">
                                        <span className="preview-tx-name">Food & Dining</span>
                                        <span className="preview-tx-date">Today, 2:30 PM</span>
                                    </div>
                                    <span className="preview-tx-amount preview-tx-amount--expense">-$45.00</span>
                                </div>
                                <div className="preview-tx">
                                    <div className="preview-tx-icon preview-tx-icon--salary">💰</div>
                                    <div className="preview-tx-info">
                                        <span className="preview-tx-name">Salary Deposit</span>
                                        <span className="preview-tx-date">Apr 1, 9:00 AM</span>
                                    </div>
                                    <span className="preview-tx-amount preview-tx-amount--income">+$4,250.00</span>
                                </div>
                                <div className="preview-tx">
                                    <div className="preview-tx-icon preview-tx-icon--shopping">🛍️</div>
                                    <div className="preview-tx-info">
                                        <span className="preview-tx-name">Online Shopping</span>
                                        <span className="preview-tx-date">Mar 30, 6:15 PM</span>
                                    </div>
                                    <span className="preview-tx-amount preview-tx-amount--expense">-$128.99</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="floating-card income">
                        <div className="icon">↑</div>
                        <div className="details">
                            <span>Income</span>
                            <strong>+$4,250.00</strong>
                        </div>
                    </div>
                    <div className="floating-card expense">
                        <div className="icon">↓</div>
                        <div className="details">
                            <span>Expense</span>
                            <strong>-$1,120.45</strong>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features">
                <div className="section-header">
                    <h2>Everything you need to <span className="text-gradient">Grow</span></h2>
                    <p>Designed for individuals who value speed, efficiency, and beautiful interfaces.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Deep Analytics</h3>
                        <p>Beautiful charts and insights to help you understand where your money goes every month.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Instant Tracking</h3>
                        <p>Add transactions in milliseconds with our optimized keyboard-first workflow.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Bank-Grade Security</h3>
                        <p>Your data is encrypted and secure. We never sell your personal information.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-card glass-panel">
                    <h2>Ready to organize your finances?</h2>
                    <p>Join thousands of users who have already taken control of their financial future.</p>
                    <button onClick={() => navigate('/login', { state: { mode: 'register' } })} className="primary-button-lg">Get Started Now</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo">
                            <LogoIcon size={28} />
                            <span className="logo-text">Expense<span className="accent">Manager</span></span>
                        </div>
                        <p>The world's most beautiful expense manager.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#demo">Demo</a>
                        </div>
                        <div className="link-group">
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="#blog">Blog</a>
                            <a href="#careers">Careers</a>
                        </div>
                        <div className="link-group">
                            <h4>Support</h4>
                            <a href="#help">Help Center</a>
                            <a href="#contact">Contact Us</a>
                            <a href="#privacy">Privacy</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 ExpenseManager. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
