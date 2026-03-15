import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CartItem from '../components/CartItem';
import {
  fetchCart,
  clearCart,
  selectCartItems,
  selectCartSubtotal,
  selectCartTax,
  selectDeliveryCharge,
  selectCartTotal,
  selectDiscount,
  validateCoupon,
  clearCoupon,
} from '../store/slices/cartSlice';
import { couponsAPI } from '../api/coupons';
import { ordersAPI } from '../api/orders';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [suggestedCoupons, setSuggestedCoupons] = useState([]);
  const [hasOrders, setHasOrders] = useState(false);

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const delivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);
  const appliedCoupon = useSelector(state => state.cart.appliedCoupon);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  useActivityLog('page_view', { section: 'cart' });

  useEffect(() => {
    const loadCart = async () => {
      try {
        await dispatch(fetchCart()).unwrap();
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [dispatch]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setHasOrders(false);
        return;
      }
      try {
        const ordersRes = await ordersAPI.getAll();
        const list = ordersRes.data?.results || ordersRes.data || [];
        setHasOrders(Array.isArray(list) && list.length > 0);
      } catch {
        setHasOrders(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchSuggested = async () => {
      if (!items.length) {
        setSuggestedCoupons([]);
        return;
      }
      try {
        const response = await couponsAPI.getSuggested(subtotal, items);
        const list = response.data?.results || response.data || [];

        const cartCategories = new Set(
          (items || [])
            .map((item) => item?.product?.category?.name)
            .filter(Boolean)
        );

        const filtered = list.filter((coupon) => {
          if (coupon.first_order_only && !isAuthenticated) return false;
          if (coupon.first_order_only && hasOrders) return false;
          const applicable = coupon.applicable_categories || [];
          if (Array.isArray(applicable) && applicable.length > 0) {
            if (cartCategories.size === 0) return false;
            return applicable.some((cat) => cartCategories.has(cat));
          }
          return true;
        });

        setSuggestedCoupons(filtered);
      } catch {
        setSuggestedCoupons([]);
      }
    };

    fetchSuggested();
  }, [items, subtotal, isAuthenticated, hasOrders]);

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Cart cleared! 🗑️');
      } catch {
        toast.error('Failed to clear cart');
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      await dispatch(validateCoupon({ code: couponCode, cartTotal: subtotal, cartItems: items })).unwrap();
      toast.success('Coupon applied successfully! 🎉');
      setCouponCode('');
    } catch (error) {
      toast.error(error || 'Invalid coupon code');
    }
  };

  const handleApplySuggested = async (code) => {
    try {
      await dispatch(validateCoupon({ code, cartTotal: subtotal, cartItems: items })).unwrap();
      toast.success('Coupon applied successfully! 🎉');
      setCouponCode('');
    } catch (error) {
      toast.error(error || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCoupon());
    toast.success('Coupon removed');
  };

  const cartCategories = new Set(
    (items || [])
      .map((item) => item?.product?.category?.name)
      .filter(Boolean)
  );

  const isSuggestedApplicable = (coupon) => {
    const minOrder = Number(coupon.min_order_value ?? 0);
    if (minOrder > 0 && subtotal < minOrder) return false;
    const applicable = coupon.applicable_categories || [];
    if (Array.isArray(applicable) && applicable.length > 0) {
      if (cartCategories.size === 0) return false;
      return applicable.some((cat) => cartCategories.has(cat));
    }
    return true;
  };

  if (loading) return <PageLoader />;

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty!</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-items">
        <div className="cart-header-row">
          <p>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          <button onClick={handleClearCart} className="btn-remove">
            Clear Cart
          </button>
        </div>

        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}

        <Link to="/shop" className="back-link continue-shopping-link">
          ← Continue Shopping
        </Link>
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>

        <div className="coupon-section">
          {appliedCoupon ? (
            <div className="applied-coupon-info">
              <div className="applied-coupon-row">
                <span>Coupon: <strong>{appliedCoupon.code}</strong></span>
                <button
                  onClick={handleRemoveCoupon}
                  className="coupon-remove-btn"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="coupon-input-wrapper">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                />
                <button onClick={handleApplyCoupon} className="btn-coupon">
                  Apply Coupon
                </button>
              </div>
            </>
          )}
        </div>

        {!appliedCoupon && suggestedCoupons.length > 0 && (
          <div className="suggested-coupons">
            <p className="suggested-title">Suggested for your cart</p>
            <div className="coupons-list">
              {suggestedCoupons
                .filter((coupon) => isSuggestedApplicable(coupon))
                .map((coupon) => {
                const canApply = true;
                return (
                  <div
                    key={coupon.code}
                    className={`coupon-card ${canApply ? 'applicable' : 'locked'}`}
                  >
                    <div className="coupon-header">
                      <h3 className="coupon-code">{coupon.code}</h3>
                    </div>
                    <div className="coupon-body">
                      <p className="coupon-description">{coupon.description}</p>
                      <div className="coupon-info">
                        <div className="coupon-info-item">
                          <strong>Minimum Order:</strong>
                          <span>₹{coupon.min_order_value}</span>
                        </div>
                        {coupon.coupon_type === 'percentage' && (
                          <div className="coupon-info-item">
                            <strong>Max Discount:</strong>
                            <span>₹{coupon.max_discount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="coupon-footer">
                      <button
                        className={`btn-copy-coupon ${canApply ? '' : 'disabled'}`}
                        onClick={() => handleApplySuggested(coupon.code)}
                        disabled={!canApply}
                      >
                        Apply Coupon
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="summary-row discount-row">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="summary-row">
          <span>Tax (8%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className="summary-row">
          <span>Delivery</span>
          <span className={delivery === 0 ? 'free-delivery' : ''}>
            {delivery === 0 ? 'FREE' : formatPrice(delivery)}
          </span>
        </div>

        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="cart-actions">
          <button onClick={() => navigate('/checkout')} className="btn-submit">
            Proceed to Checkout
          </button>
          <Link to="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
