import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import './Auth.css';

function Auth() {
    const location = useLocation();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [countrySearch, setCountrySearch] = useState('');
    const [countryResults, setCountryResults] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const countryRef = useRef(null);
    const debounceRef = useRef(null);

    const { user, login, register } = useAuth();
    const { showToast } = useFeedback();

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (countryRef.current && !countryRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCountrySearch = (value) => {
        setCountrySearch(value);
        setSelectedCountry(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setCountryResults([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            const results = await api.getCountries(value);
            setCountryResults(results);
            setShowDropdown(results.length > 0);
        }, 300);
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setCountrySearch(country.name);
        setShowDropdown(false);
    };

    const handleSuccessRedirect = useCallback((target) => {
        setSuccess(true);
        setTimeout(() => navigate(target), 1200);
    }, [navigate]);

    const isValidEmail = (value) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(value)) return false;
        const domain = value.split('@')[1];
        if (!domain || domain.split('.').some((p) => p.length < 2)) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            if (!email || !password) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
            if (!isValidEmail(email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }
            const result = await login(email, password);
            setLoading(false);
            if (result.success) {
                handleSuccessRedirect('/dashboard');
            } else {
                setError(result.message || 'Login failed');
            }
        } else {
            if (!username || !email || !password || !confirmPassword) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
            if (!isValidEmail(email)) {
                setError('Please enter a valid email address (e.g. name@gmail.com)');
                setLoading(false);
                return;
            }
            if (username.length < 3) {
                setError('Username must be at least 3 characters');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            if (!selectedCountry) {
                setError('Please select a country');
                setLoading(false);
                return;
            }
            const result = await register(username, email, password, selectedCountry.id);
            setLoading(false);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    showToast('Welcome aboard! Your account is ready — sign in below.', 'success');
                    setIsLogin(true);
                    setPassword('');
                    setConfirmPassword('');
                    setCountrySearch('');
                    setSelectedCountry(null);
                }, 1200);
            } else {
                setError(result.message || 'Registration failed');
            }
        }
    };

    const switchMode = () => {
        setIsLogin((v) => !v);
        setError('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCountrySearch('');
        setSelectedCountry(null);
        setShowDropdown(false);
    };

    return (
        <div className="auth-page">
            {/* Left — decorative branding panel */}
            <div className="auth-left">
                <div className="auth-left-inner">
                    <div className="auth-left-logo" onClick={() => navigate('/')}>
                        <span className="auth-left-logo-icon-wrap">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </span>
                        <span className="auth-left-logo-text">
                            Expense<span className="auth-left-logo-accent">Manager</span>
                        </span>
                    </div>

                    <div className="auth-left-hero">
                        <h2 className="auth-left-title">
                            {isLogin ? 'Welcome back!' : 'Join us today'}
                        </h2>
                        <p className="auth-left-desc">
                            {isLogin
                                ? 'Sign in to continue managing your finances with next-gen intelligence.'
                                : 'Create your account and start tracking your expenses effortlessly.'}
                        </p>
                    </div>

                    {/* Decorative floating cards */}
                    <div className="auth-left-visual">
                        <div className="auth-float-card auth-float-card--income">
                            <div className="auth-float-icon auth-float-icon--income">↑</div>
                            <div>
                                <span className="auth-float-label">Income</span>
                                <strong className="auth-float-value auth-float-value--income">+$4,250.00</strong>
                            </div>
                        </div>
                        <div className="auth-float-card auth-float-card--expense">
                            <div className="auth-float-icon auth-float-icon--expense">↓</div>
                            <div>
                                <span className="auth-float-label">Expense</span>
                                <strong className="auth-float-value auth-float-value--expense">-$1,120.45</strong>
                            </div>
                        </div>
                    </div>

                    <div className="auth-left-stats">
                        <div className="auth-stat">
                            <span className="auth-stat-val">10k+</span>
                            <span className="auth-stat-label">Active Users</span>
                        </div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat">
                            <span className="auth-stat-val">4.9/5</span>
                            <span className="auth-stat-label">User Rating</span>
                        </div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat">
                            <span className="auth-stat-val">$1M+</span>
                            <span className="auth-stat-label">Tracked Monthly</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — form panel */}
            <div className="auth-right">
                <div className="auth-form-wrap">
                    <button onClick={() => navigate('/')} className="auth-back-link">
                        ← Back to home
                    </button>

                    <div className="auth-card">
                        {/* Avatar */}
                        <div className="auth-avatar">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>

                        <h1 className="auth-heading">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </h1>
                        <p className="auth-subheading">
                            {isLogin
                                ? 'Enter your credentials to access your dashboard'
                                : 'Fill in your details to get started'}
                        </p>

                        {error && (
                            <div className="auth-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="auth-field">
                                    <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="auth-input"
                                    />
                                </div>
                            )}

                            <div className="auth-field">
                                <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="M22 7l-10 7L2 7" />
                                </svg>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="auth-input"
                                />
                            </div>

                            {!isLogin && (
                                <div className="auth-field auth-country-field" ref={countryRef}>
                                    <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Select your country"
                                        value={countrySearch}
                                        onChange={(e) => handleCountrySearch(e.target.value)}
                                        onFocus={() => { if (countryResults.length > 0) setShowDropdown(true); }}
                                        className="auth-input"
                                        autoComplete="off"
                                    />
                                    {selectedCountry && (
                                        <span className="auth-country-badge">{selectedCountry.currencySymbol}</span>
                                    )}
                                    {showDropdown && (
                                        <div className="auth-country-dropdown">
                                            {countryResults.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    className={`auth-country-option ${selectedCountry?.id === c.id ? 'auth-country-option--active' : ''}`}
                                                    onClick={() => selectCountry(c)}
                                                >
                                                    <span className="auth-country-name">{c.name}</span>
                                                    <span className="auth-country-currency">{c.currencySymbol} {c.currencyCode}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="auth-field">
                                <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input"
                                    autoComplete="current-password"
                                />
                            </div>

                            {!isLogin && (
                                <div className="auth-field">
                                    <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type="password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="auth-input"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`auth-submit primary-button ${success ? 'auth-submit--success' : ''}`}
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <span className="auth-spinner" />
                                ) : success ? (
                                    '✓ Success'
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <span>
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            </span>
                            <button type="button" onClick={switchMode} className="auth-switch">
                                {isLogin ? 'Create one' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
