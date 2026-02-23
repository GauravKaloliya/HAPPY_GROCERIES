import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../store/slices/cartSlice';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ShopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const WishlistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems = [
  { Icon: HomeIcon, label: 'Home', path: '/' },
  { Icon: ShopIcon, label: 'Shop', path: '/shop' },
  { Icon: CartIcon, label: 'Cart', path: '/cart', showBadge: true },
  { Icon: WishlistIcon, label: 'Wishlist', path: '/wishlist' },
  { Icon: ProfileIcon, label: 'Profile', path: '/profile' },
];

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {navItems.map(({ Icon, label, path, showBadge }) => ( // eslint-disable-line no-unused-vars
          <button
            key={path}
            className={`mobile-nav-item${isActive(path) ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <span className="mobile-nav-icon-wrap">
              <Icon />
              {showBadge && cartCount > 0 && (
                <span className="mobile-nav-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </span>
            <span className="mobile-nav-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
