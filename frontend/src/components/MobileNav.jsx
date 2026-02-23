import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useSelector((state) => state.cart.items.length);

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🛍️', label: 'Shop', path: '/shop' },
    { icon: '📦', label: 'Cart', path: '/cart', showBadge: true },
    { icon: '❤️', label: 'Wishlist', path: '/wishlist' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`mobile-nav-item ${isActive(item.path)}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <span className="nav-icon">
              {item.icon}
              {item.showBadge && cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '12px',
                    background: '#ff4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
