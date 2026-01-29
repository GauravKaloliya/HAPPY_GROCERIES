import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    
    const { login, isAuthenticated, loading } = useAuth();
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

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const result = await login(formData.phone, formData.password);
            
            if (result.success) {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <Link to="/" className="login-logo">
                        <span className="logo-icon">🛒</span>
                        <span className="logo-text">Happy Groceries</span>
                    </Link>
                    <h1 className="login-title">Welcome Back!</h1>
                    <p className="login-subtitle">Login to your account to continue shopping</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            Phone Number
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
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                placeholder="Enter your password"
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
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="signup-prompt">
                        Don't have an account?{' '}
                        <Link to="/signup" className="signup-link">
                            Sign up here
                        </Link>
                    </p>
                </div>

                <div className="demo-credentials">
                    <h3>Demo Credentials:</h3>
                    <p><strong>Phone:</strong> 1234567890</p>
                    <p><strong>Password:</strong> password123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;