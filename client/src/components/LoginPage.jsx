// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './css/LoginPage.css';

// const LoginPage = () => {
//     const [isRegisterMode, setIsRegisterMode] = useState(false);
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [email, setEmail] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         try {
//             const response = await fetch('/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 credentials: 'include',
//                 body: JSON.stringify({ username, password }),
//             });

//             const result = await response.json();

//             if (result.success) {
//                 sessionStorage.setItem('userRole', result.role);
//                 sessionStorage.setItem('isAuthenticated', 'true');
//                 sessionStorage.setItem('userId', result.user_id);
//                 sessionStorage.setItem('username', result.username);


//                 if (result.role === 'tester') {
//                     navigate('/dashboard');
//                 } else {
//                     setError('Unknown user role');
//                 }
//             } else {
//                 setError(result.message || 'Login failed');
//             }
//         } catch (error) {
//             setError('An error occurred during login. Please try again.');
//             console.error('Login error:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         setError('');

//         // Only check confirm password on the frontend
//         if (isRegisterMode && password !== confirmPassword) {
//             setError('Passwords do not match');
//             return;
//         }

//         setLoading(true);

//         try {
//             const response = await fetch('/register', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 credentials: 'include',
//                 body: JSON.stringify({ username, password }),
//             });

//             const result = await response.json();

//             if (result.success) {
//                 // Automatically log in after successful registration
//                 sessionStorage.setItem('userRole', result.role);
//                 sessionStorage.setItem('isAuthenticated', 'true');
//                 sessionStorage.setItem('userId', result.user_id);
//                 sessionStorage.setItem('username', result.username);

//                 if (result.role === 'tester') {
//                     navigate('/dashboard');
//                 } else {
//                     setError('Unknown user role');
//                 }
//             } else {
//                 setError(result.message || 'Registration failed');
//             }
//         } catch (error) {
//             setError('An error occurred during registration. Please try again.');
//             console.error('Registration error:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const toggleAuthMode = () => {
//         setIsRegisterMode(!isRegisterMode);
//         setError('');
//         setUsername('');
//         setPassword('');
//         setConfirmPassword('');
//         setEmail('');
//     };

//     const handleDemoLogin = (demoUsername, demoPassword) => {
//         setUsername(demoUsername);
//         setPassword(demoPassword);
//     };

//     return (
//         <div className="login-container">
//             {/* Left Side - Brand & Info */}
//             <div className="brand-section">
//                 <div className="brand-content">
//                     <div className="brand-header">
//                         <div className="brand-logo-container">
//                             <img src="/android-chrome-192x192.png" alt="WinSecure" className="brand-logo" />
//                         </div>
//                         <div className="brand-text">
//                             <h1><span class="win">Win</span><span class="secure">Secure</span></h1>
//                             <span className="brand-tagline">Enterprise Security Testing Platform</span>
//                         </div>
//                     </div>
                    
//                     <div className="brand-description">
//                         <p>Comprehensive cybersecurity solutions for modern enterprises. Protect your infrastructure with advanced threat detection, vulnerability assessment, and real-time monitoring.</p>
//                     </div>

//                     <div className="feature-grid">
//                         <div className="feature-card">
//                             <div className="feature-icon-wrapper">
//                                 <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                             </div>
//                             <div className="feature-content">
//                                 <h3>System Health Check</h3>
//                                 <p>Comprehensive analysis of your infrastructure integrity and performance optimization</p>
//                             </div>
//                         </div>
                        
//                         <div className="feature-card">
//                             <div className="feature-icon-wrapper">
//                                 <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                                 </svg>
//                             </div>
//                             <div className="feature-content">
//                                 <h3>Infrastructure Monitoring</h3>
//                                 <p>Advanced oversight and protection mechanisms for enterprise environments</p>
//                             </div>
//                         </div>
                        
//                         <div className="feature-card">
//                             <div className="feature-icon-wrapper">
//                                 <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                 </svg>
//                             </div>
//                             <div className="feature-content">
//                                 <h3>Compliance Analytics</h3>
//                                 <p>Detailed reporting and audit documentation for regulatory requirements</p>
//                             </div>
//                         </div>

//                         <div className="feature-card">
//                             <div className="feature-icon-wrapper">
//                                 <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                                 </svg>
//                             </div>
//                             <div className="feature-content">
//                                 <h3>Automated Intelligence</h3>
//                                 <p>Smart validation processes with proactive alerting and response systems</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Right Side - Auth Card */}
//             <div className="auth-section">
//                 <div className="auth-card">
//                     <div className="auth-header">
//                         <h2>{isRegisterMode ? 'Create Account' : 'Welcome Back'}</h2>
//                         <p>{isRegisterMode ? 'Join WinSecure to start securing your systems' : 'Sign in to access your security dashboard'}</p>
//                     </div>

//                     <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="auth-form">
//                         <div className="form-group">
//                             <label className="form-label">Username</label>
//                             <input
//                                 type="text"
//                                 placeholder="Enter your username"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 required
//                                 disabled={loading}
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Password</label>
//                             <input
//                                 type="password"
//                                 placeholder="Enter your password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                                 disabled={loading}
//                                 className="form-input"
//                             />
//                         </div>

//                         {isRegisterMode && (
//                             <div className="form-group">
//                                 <label className="form-label">Confirm Password</label>
//                                 <input
//                                     type="password"
//                                     placeholder="Confirm your password"
//                                     value={confirmPassword}
//                                     onChange={(e) => setConfirmPassword(e.target.value)}
//                                     required
//                                     disabled={loading}
//                                     className="form-input"
//                                 />
//                             </div>
//                         )}

//                         {error && <div className="error-message">{error}</div>}

//                         <button type="submit" disabled={loading} className="submit-btn">
//                             {loading && <div className="loading-spinner"></div>}
//                             {loading ? 
//                                 (isRegisterMode ? 'Creating Account...' : 'Signing In...') : 
//                                 (isRegisterMode ? 'Create Account' : 'Sign In')
//                             }
//                         </button>
//                     </form>

//                     <div className="auth-switch">
//                         <p>
//                             {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
//                             <button type="button" onClick={toggleAuthMode} className="switch-btn">
//                                 {isRegisterMode ? 'Sign In' : 'Create Account'}
//                             </button>
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* Footer */}
//             <div className="footer">
//                 <p>&copy; 2024 WinSecure - Enterprise Security Testing Platform. All rights reserved.</p>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const LoginPage = () => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // ✅ Real router hook

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

    const CheckIcon = () => (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const CubeIcon = () => (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    );

    const DocumentIcon = () => (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const LightningIcon = () => (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse delay-500"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            {/* Left Side - Brand & Features */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative z-10">
                <div className="max-w-3xl w-full text-white">
         <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-8">
    {/* Logo without background */}
    <img 
        src="/android-chrome-192x192.png" 
        alt="WinSecure Logo" 
        className="w-24 h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 drop-shadow-lg"
    />

    {/* Brand Text */}
    <div className="text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-2">
            <span className="text-blue-400">Win</span>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Secure</span>
        </h1>
        <p className="text-blue-200 text-lg lg:text-xl font-semibold">
            Enterprise Security Testing Platform
        </p>
    </div>
</div>



                    {/* Description */}
<div className="mb-8 text-center lg:text-center flex justify-center">
    <p className="text-lg text-gray-300 leading-relaxed max-w-2xl text-justify">
        Comprehensive cybersecurity solutions for modern enterprises. Protect your infrastructure with threat detection, assessment, and real-time monitoring.
    </p>
</div>


                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                                    <CheckIcon />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">System Health Check</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Comprehensive analysis of your infrastructure integrity and performance optimization
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                                    <CubeIcon />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Infrastructure Monitoring</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Advanced oversight and protection mechanisms for enterprise environments
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                                    <DocumentIcon />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Compliance Analytics</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Detailed reporting and audit documentation for regulatory requirements
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                                    <LightningIcon />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Automated Intelligence</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Smart validation processes with proactive alerting and response systems
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Card */}
            <div className="w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center p-4 lg:p-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                        {/* Card Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 rounded-3xl"></div>
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                                </h2>
                                <p className="text-gray-600">
                                    {isRegisterMode 
                                        ? 'Join WinSecure to start securing your systems' 
                                        : 'Sign in to access your security dashboard'
                                    }
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {isRegisterMode && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                )}

                               {error && (
    <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2 text-center flex items-center justify-center gap-2 shadow-sm">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 11-0.001 14.001A7 7 0 0112 5z" />
        </svg>
        <span>{error}</span>
    </div>
)}


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 relative overflow-hidden"
                                >
                                    {loading && (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    )}
                                    <span>
                                        {loading 
                                            ? (isRegisterMode ? 'Creating Account...' : 'Signing In...') 
                                            : (isRegisterMode ? 'Create Account' : 'Sign In')
                                        }
                                    </span>
                                    {/* Button shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </button>
                            </form>

                            {/* Auth Switch */}
                            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                <p className="text-gray-600">
                                    {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                                    <button
                                        type="button"
                                        onClick={toggleAuthMode}
                                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors duration-200"
                                    >
                                        {isRegisterMode ? 'Sign In' : 'Create Account'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10 p-4 text-center z-20">
                <p className="text-white/80 text-sm">
                    &copy; 2024 WinSecure - Enterprise Security Testing Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;