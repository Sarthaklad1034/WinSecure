import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/LoginPage.css';

const LoginPage = () => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('userRole', result.role);
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userId', result.user_id);
                sessionStorage.setItem('username', result.username);


                if (result.role === 'tester') {
                    navigate('/dashboard');
                } else {
                    setError('Unknown user role');
                }
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError('An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Only check confirm password on the frontend
        if (isRegisterMode && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.success) {
                // Automatically log in after successful registration
                sessionStorage.setItem('userRole', result.role);
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userId', result.user_id);
                sessionStorage.setItem('username', result.username);

                if (result.role === 'tester') {
                    navigate('/dashboard');
                } else {
                    setError('Unknown user role');
                }
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (error) {
            setError('An error occurred during registration. Please try again.');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
    };

    const handleDemoLogin = (demoUsername, demoPassword) => {
        setUsername(demoUsername);
        setPassword(demoPassword);
    };

    return (
        <div className="login-container">
            {/* Left Side - Brand & Info */}
            <div className="brand-section">
                <div className="brand-content">
                    <div className="brand-header">
                        <div className="brand-logo-container">
                            <img src="/android-chrome-192x192.png" alt="WinSecure" className="brand-logo" />
                        </div>
                        <div className="brand-text">
                            <h1><span class="win">Win</span><span class="secure">Secure</span></h1>
                            <span className="brand-tagline">Enterprise Security Testing Platform</span>
                        </div>
                    </div>
                    
                    <div className="brand-description">
                        <p>Comprehensive cybersecurity solutions for modern enterprises. Protect your infrastructure with advanced threat detection, vulnerability assessment, and real-time monitoring.</p>
                    </div>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="feature-content">
                                <h3>System Health Check</h3>
                                <p>Comprehensive analysis of your infrastructure integrity and performance optimization</p>
                            </div>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="feature-content">
                                <h3>Infrastructure Monitoring</h3>
                                <p>Advanced oversight and protection mechanisms for enterprise environments</p>
                            </div>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="feature-content">
                                <h3>Compliance Analytics</h3>
                                <p>Detailed reporting and audit documentation for regulatory requirements</p>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="feature-content">
                                <h3>Automated Intelligence</h3>
                                <p>Smart validation processes with proactive alerting and response systems</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Card */}
            <div className="auth-section">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>{isRegisterMode ? 'Create Account' : 'Welcome Back'}</h2>
                        <p>{isRegisterMode ? 'Join WinSecure to start securing your systems' : 'Sign in to access your security dashboard'}</p>
                    </div>

                    <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        {isRegisterMode && (
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading && <div className="loading-spinner"></div>}
                            {loading ? 
                                (isRegisterMode ? 'Creating Account...' : 'Signing In...') : 
                                (isRegisterMode ? 'Create Account' : 'Sign In')
                            }
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>
                            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button type="button" onClick={toggleAuthMode} className="switch-btn">
                                {isRegisterMode ? 'Sign In' : 'Create Account'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="footer">
                <p>&copy; 2024 WinSecure - Enterprise Security Testing Platform. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LoginPage;