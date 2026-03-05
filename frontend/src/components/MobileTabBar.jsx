import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const MobileTabBar = () => {
  const cartCount = useSelector(selectCartCount);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <nav className="mobile-tabbar" aria-label="Mobile navigation">
      <NavLink to="/" className="mobile-tab-item">
        <span>🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/shop" className="mobile-tab-item">
        <span>🛍️</span>
        <span>Shop</span>
      </NavLink>
      <NavLink to="/cart" className="mobile-tab-item mobile-tab-cart">
        <span>🛒</span>
        <span>Cart</span>
        {cartCount > 0 && <b className="mobile-tab-badge">{cartCount}</b>}
      </NavLink>
      <NavLink to="/offers" className="mobile-tab-item">
        <span>🏷️</span>
        <span>Offers</span>
      </NavLink>
      <NavLink to={isAuthenticated ? '/profile' : '/login'} className="mobile-tab-item">
        <span>👤</span>
        <span>Me</span>
      </NavLink>
    </nav>
  );
};

export default MobileTabBar;
