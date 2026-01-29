import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    // Load theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('happyGroceries_theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        
        if (newTheme) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('happyGroceries_theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('happyGroceries_theme', 'light');
        }
    };

    const toggleMobileMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="nav-content">
                    {/* Logo */}
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon">🛒</span>
                        <span className="logo-text">Happy Groceries</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="nav-links">
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                            Home
                        </Link>
                        <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                            Products
                        </Link>
                        <Link to="/offers" className={`nav-link ${location.pathname === '/offers' ? 'active' : ''}`}>
                            Offers
                        </Link>
                    </div>

                    {/* Right Side Icons */}
                    <div className="nav-actions">
                        {/* Theme Toggle */}
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>

                        {/* Wishlist Icon */}
                        {isAuthenticated && (
                            <Link to="/wishlist" className="nav-icon" aria-label="Wishlist">
                                <span className="icon">💝</span>
                            </Link>
                        )}

                        {/* Cart Icon */}
                        <Link to="/cart" className="nav-icon cart-icon" aria-label="Shopping Cart">
                            <span className="icon">🛒</span>
                            {cartCount > 0 && (
                                <span className="cart-count">{cartCount}</span>
                            )}
                        </Link>

                        {/* User Authentication */}
                        {isAuthenticated ? (
                            <div className="profile-dropdown">
                                <button
                                    className="profile-button"
                                    onClick={toggleProfileDropdown}
                                    aria-label="User Profile"
                                >
                                    <span className="profile-avatar">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <span className="profile-name">{user?.name || 'User'}</span>
                                    <span className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`}>▼</span>
                                </button>

                                {isProfileOpen && (
                                    <div className="dropdown-menu">
                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                            👤 My Profile
                                        </Link>
                                        <Link to="/orders" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                            📦 My Orders
                                        </Link>
                                        <Link to="/wishlist" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                            💝 Wishlist
                                        </Link>
                                        <hr className="dropdown-divider" />
                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-outline btn-sm">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-nav-links">
                            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                🏠 Home
                            </Link>
                            <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                🛍️ Products
                            </Link>
                            <Link to="/offers" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                🎁 Offers
                            </Link>
                            
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                        🔐 Login
                                    </Link>
                                    <Link to="/signup" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                        ✨ Sign Up
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <hr className="mobile-divider" />
                                    <div className="mobile-user-info">
                                        <span className="mobile-user-name">Hello, {user?.name}</span>
                                    </div>
                                    <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                        👤 My Profile
                                    </Link>
                                    <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                        📦 My Orders
                                    </Link>
                                    <Link to="/wishlist" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                        💝 Wishlist
                                    </Link>
                                    <button className="mobile-nav-link logout-btn" onClick={handleLogout}>
                                        🚪 Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;