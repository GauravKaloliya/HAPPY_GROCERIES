import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { themeIcon, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">Happy Groceries 🛒</Link>
        </div>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link></li>
          <li><Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>Shop</Link></li>
          <li><Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>Categories</Link></li>
          <li><Link to="/offers" className={`nav-link ${isActive('/offers') ? 'active' : ''}`}>Offers</Link></li>
          <li><Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link></li>
        </ul>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {themeIcon}
          </button>

          <Link to="/cart" className="cart-icon">
            🛒
            {itemCount > 0 && (
              <span className="cart-counter">{itemCount}</span>
            )}
          </Link>

          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-signup">Sign Up</Link>
            </div>
          ) : (
            <div className="user-profile" ref={dropdownRef}>
              <button 
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user?.name?.split(' ')[0] || 'Profile'} ▼
              </button>
              <div className={`profile-dropdown ${dropdownOpen ? 'active' : ''}`}>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>👤 Profile</Link>
                <Link to="/orders" onClick={() => setDropdownOpen(false)}>📦 Orders</Link>
                <Link to="/wishlist" onClick={() => setDropdownOpen(false)}>💖 Wishlist</Link>
                <hr />
                <button onClick={handleLogout}>🚪 Logout</button>
              </div>
            </div>
          )}

          <button 
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
