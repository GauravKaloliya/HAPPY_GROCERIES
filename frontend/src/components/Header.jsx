import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectIsDarkMode } from '../store/slices/themeSlice';
import { logout, selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { selectCartCount } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const parseXML = (xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const getTextContent = (parent, tag) => parent.querySelector(tag)?.textContent || '';

  const navItems = Array.from(doc.querySelectorAll('navigation navItem')).map((item) => ({
    label: getTextContent(item, 'label'),
    href: getTextContent(item, 'href'),
  }));

  const userMenuItems = Array.from(doc.querySelectorAll('userMenu menuItem')).map((item) => ({
    icon: getTextContent(item, 'icon'),
    label: getTextContent(item, 'label'),
    href: getTextContent(item, 'href'),
  }));

  return {
    brand: {
      logo: getTextContent(doc, 'brand logo'),
      name: getTextContent(doc, 'brand name'),
      href: getTextContent(doc, 'brand href'),
    },
    navItems,
    userMenuItems,
  };
};

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const isDarkMode = useSelector(selectIsDarkMode);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectCartCount);

  useEffect(() => {
    fetch('/header-config.xml')
      .then((res) => res.text())
      .then((text) => setConfig(parseXML(text)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname.startsWith('/admin') ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  const baseNavItems = config?.navItems || [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: '🎉 Offers', href: '/offers' },
    { label: 'About', href: '/about' },
  ];
  const navItems = baseNavItems.some((item) => item.href === '/admin')
    ? baseNavItems
    : [...baseNavItems, { label: 'Admin', href: '/admin' }];

  const userMenuItems = config?.userMenuItems || [
    { icon: '👤', label: 'Profile', href: '/profile' },
    { icon: '📦', label: 'Orders', href: '/orders' },
    { icon: '⭐', label: 'My Reviews', href: '/my-reviews' },
    { icon: '❤️', label: 'Wishlist', href: '/wishlist' },
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ];

  const brandName = config?.brand?.name || 'Happy Groceries';
  const brandLogo = config?.brand?.logo || '🛒';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">
            <span className="nav-logo-icon">{brandLogo}</span>
            <span className="nav-logo-text">{brandName}</span>
          </Link>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className={`nav-link ${isActive(item.href)}`}>
                {item.label}
              </Link>
            </li>
          ))}
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

          <div ref={dropdownRef}>
            {isAuthenticated ? (
              <div className="user-profile">
                <button
                  className="profile-btn"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {user?.first_name || user?.username || 'User'} ▼
                </button>
                <div className={`profile-dropdown ${isProfileOpen ? 'active' : ''}`}>
                  {userMenuItems.map((item) => (
                    <Link key={item.href} to={item.href} onClick={() => setIsProfileOpen(false)}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
