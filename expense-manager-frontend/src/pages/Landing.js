import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="landing-container">
            {/* Navigation Bar for Landing Page */}
            <nav className="landing-nav">
                <div className="logo">
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">Expense<span className="accent">Wise</span></span>
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
                        Take full control of your finances with ExpenseWise. Track, analyze, and optimize 
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
                            <div className="skeleton title"></div>
                            <div className="skeleton-grid">
                                <div className="skeleton card"></div>
                                <div className="skeleton card"></div>
                                <div className="skeleton card"></div>
                            </div>
                            <div className="skeleton chart"></div>
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
                            <span className="logo-icon">🚀</span>
                            <span className="logo-text">Expense<span className="accent">Wise</span></span>
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
                    <p>© 2026 ExpenseWise. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
