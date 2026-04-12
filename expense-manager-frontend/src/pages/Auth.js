import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Initial state based on navigation state
    const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, login, register } = useAuth();

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        if (isLogin) {
            if (!email || !password) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
            const result = await login(email, password);
            setLoading(false);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Login failed');
            }
        } else {
            if (!username || !email || !password || !confirmPassword) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            const result = await register(username, email, password);
            setLoading(false);
            if (result.success) {
                setSuccessMsg('Registration successful! You can now login.');
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(result.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <button onClick={() => navigate('/')} className="back-button">
                        <span className="back-arrow">←</span> Back
                    </button>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Login to manage your expenses.' : 'Sign up to get started.'}</p>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {successMsg && <div className="auth-success" style={{ color: '#4CAF50', marginBottom: '1rem', textAlign: 'center' }}>{successMsg}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="auth-input"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="auth-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="auth-input"
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="auth-input"
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            className="auth-toggle"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccessMsg('');
                                setUsername('');
                                setEmail('');
                                setPassword('');
                                setConfirmPassword('');
                            }}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Auth;
