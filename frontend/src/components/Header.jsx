import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectIsDarkMode } from '../store/slices/themeSlice';
import { logout, selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { selectCartCount } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  
  const isDarkMode = useSelector(selectIsDarkMode);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectCartCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully! 👋');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
    setIsProfileOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">🛒 Happy Groceries</Link>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link></li>
          <li><Link to="/shop" className={`nav-link ${isActive('/shop')}`}>Shop</Link></li>
          <li><Link to="/categories" className={`nav-link ${isActive('/categories')}`}>Categories</Link></li>
          <li><Link to="/offers" className={`nav-link ${isActive('/offers')}`}>🎉 Offers</Link></li>
          <li><Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link></li>
        </ul>

        <div className="nav-actions">
          <button 
            className="theme-toggle" 
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/cart" className="cart-icon">
            🛒
            {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-profile" ref={dropdownRef}>
              <button 
                className="profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {user?.first_name || user?.username || 'User'} ▼
              </button>
              <div className={`profile-dropdown ${isProfileOpen ? 'active' : ''}`}>
                <Link to="/profile" onClick={() => setIsProfileOpen(false)}>👤 Profile</Link>
                <Link to="/orders" onClick={() => setIsProfileOpen(false)}>📦 Orders</Link>
                <Link to="/wishlist" onClick={() => setIsProfileOpen(false)}>❤️ Wishlist</Link>
                <Link to="/settings" onClick={() => setIsProfileOpen(false)}>⚙️ Settings</Link>
                <hr />
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  🚪 Logout
                </a>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/signup" className="btn-signup">Sign Up</Link>
            </div>
          )}

          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
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

export default Header;
