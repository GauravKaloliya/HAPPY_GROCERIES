import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { register, isAuthenticated, loading, checkPasswordStrength } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'Name must be less than 50 characters';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        // Email validation (optional)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const result = await register(
                formData.name.trim(),
                formData.phone,
                formData.email.trim(),
                formData.password
            );
            
            if (result.success) {
                navigate('/login', { 
                    state: { message: 'Registration successful! Please login with your credentials.' }
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    const passwordStrength = formData.password ? checkPasswordStrength(formData.password) : null;

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-header">
                    <Link to="/" className="signup-logo">
                        <span className="logo-icon">🛒</span>
                        <span className="logo-text">Happy Groceries</span>
                    </Link>
                    <h1 className="signup-title">Create Account</h1>
                    <p className="signup-subtitle">Join us and start your fresh grocery journey!</p>
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength="50"
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={`form-input ${errors.phone ? 'error' : ''}`}
                            placeholder="Enter your 10-digit phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            maxLength="10"
                        />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address <span className="optional-label">(Optional)</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            maxLength="100"
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password *
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-label">
                                    Password Strength: 
                                    <span className={`strength-text ${passwordStrength?.strength?.toLowerCase()}`}>
                                        {passwordStrength?.strength}
                                    </span>
                                </div>
                                <div className="strength-bar">
                                    <div 
                                        className={`strength-fill ${passwordStrength?.strength?.toLowerCase()}`}
                                        style={{ 
                                            width: `${passwordStrength?.checks 
                                                ? (Object.values(passwordStrength.checks).filter(Boolean).length / 5) * 100 
                                                : 0}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password *
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg signup-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="signup-footer">
                    <p className="login-prompt">
                        Already have an account?{' '}
                        <Link to="/login" className="login-link">
                            Login here
                        </Link>
                    </p>
                </div>

                <div className="signup-benefits">
                    <h3>Why join Happy Groceries?</h3>
                    <ul>
                        <li>✨ Fresh groceries delivered to your door</li>
                        <li>🎯 Personalized recommendations</li>
                        <li>💰 Exclusive offers and discounts</li>
                        <li>📱 Easy order tracking and history</li>
                        <li>🛡️ Secure and safe shopping</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Signup;