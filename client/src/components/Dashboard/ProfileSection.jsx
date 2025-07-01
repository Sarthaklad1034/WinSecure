import React, { useState, useEffect } from 'react';
import { User, Lock, Check, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import './../css/ProfileSection.css';

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
        <div className="profile-container">
            <div className="profile-wrapper">
                {/* Header Section */}
                <div className="profile-header">
                    <h1>Profile Settings</h1>
                    <p>Secure your account with updated credentials</p>
                </div>

                {/* Main Profile Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <div className="header-content-card">
                            <h2>Account Information</h2>
                        </div>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                {/* Username Field */}
                                <div className="form-group">
                                    <label htmlFor="username">
                                        <User size={16} />
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter username"
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row password-row">
                                {/* Password Field */}
                                <div className="form-group">
                                    <label htmlFor="password">
                                        <Lock size={16} />
                                        New Password
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password"
                                            className="form-input"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => togglePasswordVisibility('password')}
                                            disabled={loading}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <Lock size={16} />
                                        Confirm Password
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm password"
                                            className="form-input"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
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
                                <div className={`alert alert-${message.type}`}>
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
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
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