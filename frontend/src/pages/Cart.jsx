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
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const delivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);
  const appliedCoupon = useSelector(state => state.cart.appliedCoupon);
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
      await dispatch(validateCoupon({ code: couponCode, cartTotal: subtotal })).unwrap();
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
                  Apply
                </button>
              </div>
            </>
          )}
        </div>

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
