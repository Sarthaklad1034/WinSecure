import React, { useState, useEffect } from 'react';
import { User, Lock, Check, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

const ProfileSection = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentUsername, setCurrentUsername] = useState('');

    // Load current username on component mount
    useEffect(() => {
        const username = sessionStorage.getItem('username');
        if (username) {
            setCurrentUsername(username);
            setFormData(prev => ({ ...prev, username }));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear message when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };

    const validateForm = () => {
        const { username, password, confirmPassword } = formData;

        // Check if all fields are filled
        if (!username.trim() || !password || !confirmPassword) {
            setMessage({
                type: 'error',
                text: 'All fields are required'
            });
            return false;
        }

        // Username validation
        if (username.trim().length < 3) {
            setMessage({
                type: 'error',
                text: 'Username must be at least 3 characters long'
            });
            return false;
        }

        // Password validation
        if (password.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 6 characters long'
            });
            return false;
        }

        // Password confirmation validation
        if (password !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Passwords do not match'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username.trim(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update session storage with new username
                sessionStorage.setItem('username', formData.username.trim());
                setCurrentUsername(formData.username.trim());
                
                setMessage({
                    type: 'success',
                    text: 'Profile updated successfully!'
                });

                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Failed to update profile'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center md:p-6 sm:p-4 font-sans">
            <div className="w-full max-w-xl">
                {/* Header Section */}
                <div className="text-center mb-6 md:mb-6 sm:mb-5">
                    <h1 className="text-4xl md:text-3xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent tracking-tight">
                        Profile Settings
                    </h1>
                    <p className="text-lg text-slate-500 font-normal m-0 sm:text-base">
                        Secure your account with updated credentials
                    </p>
                </div>

                {/* Main Profile Card */}
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden backdrop-blur-sm relative">
                    {/* Top gradient border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"></div>
                    
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 px-8 md:px-8 md:py-5 sm:px-6 sm:py-4 border-b border-slate-200 relative">
                        <div className="flex items-center justify-center gap-3">
                            <h2 className="text-xl font-semibold m-0 text-slate-800 tracking-tight sm:text-lg">
                                Account Information
                            </h2>
                        </div>
                    </div>

                    <div className="p-8 md:p-6 sm:p-5">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-5 sm:gap-4">
                            {/* Username Field */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="username" className="flex items-center gap-2.5 font-semibold text-gray-700 text-sm m-0 tracking-tight">
                                    <User size={16} className="text-blue-600" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter username"
                                    className="w-full px-4 py-3 sm:px-4 sm:py-3.5 border-2 border-slate-200 rounded-xl text-base font-medium transition-all duration-300 ease-out bg-white text-slate-800 box-border outline-none placeholder-slate-400 hover:border-slate-300 focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10 focus:-translate-y-0.5 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-slate-200"
                                    disabled={loading}
                                    style={{ fontSize: window.innerWidth <= 480 ? '16px' : '1rem' }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 md:grid-cols-1 md:gap-5 sm:gap-4">
                                {/* Password Field */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="password" className="flex items-center gap-2.5 font-semibold text-gray-700 text-sm m-0 tracking-tight">
                                        <Lock size={16} className="text-blue-600" />
                                        New Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password"
                                            className="w-full px-4 py-3 sm:px-4 sm:py-3.5 pr-12 sm:pr-12 border-2 border-slate-200 rounded-xl text-base font-medium transition-all duration-300 ease-out bg-white text-slate-800 box-border outline-none placeholder-slate-400 hover:border-slate-300 focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10 focus:-translate-y-0.5 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-slate-200"
                                            disabled={loading}
                                            style={{ fontSize: window.innerWidth <= 480 ? '16px' : '1rem' }}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 sm:right-3 bg-none border-none text-slate-500 cursor-pointer p-2 rounded-lg transition-all duration-300 ease-out flex items-center justify-center hover:text-blue-600 hover:bg-blue-600/10 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                                            onClick={() => togglePasswordVisibility('password')}
                                            disabled={loading}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="confirmPassword" className="flex items-center gap-2.5 font-semibold text-gray-700 text-sm m-0 tracking-tight">
                                        <Lock size={16} className="text-blue-600" />
                                        Confirm Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm password"
                                            className="w-full px-4 py-3 sm:px-4 sm:py-3.5 pr-12 sm:pr-12 border-2 border-slate-200 rounded-xl text-base font-medium transition-all duration-300 ease-out bg-white text-slate-800 box-border outline-none placeholder-slate-400 hover:border-slate-300 focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10 focus:-translate-y-0.5 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-slate-200"
                                            disabled={loading}
                                            style={{ fontSize: window.innerWidth <= 480 ? '16px' : '1rem' }}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 sm:right-3 bg-none border-none text-slate-500 cursor-pointer p-2 rounded-lg transition-all duration-300 ease-out flex items-center justify-center hover:text-blue-600 hover:bg-blue-600/10 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            disabled={loading}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Message Display */}
                            {message.text && (
                                <div className={`flex items-center gap-3.5 px-5 py-4 rounded-xl font-medium text-sm animate-pulse border-2 ${
                                    message.type === 'success' 
                                        ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-300' 
                                        : 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-red-300'
                                }`}>
                                    {message.type === 'success' ? (
                                        <Check size={16} />
                                    ) : (
                                        <AlertCircle size={16} />
                                    )}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-6 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 ease-out flex items-center justify-center gap-2.5 mt-2 tracking-tight shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 active:-translate-y-px active:shadow-lg active:shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:bg-slate-400 disabled:shadow-none"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Updating Profile...
                                    </>
                                ) : (
                                    <>
                                        Update Information
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;