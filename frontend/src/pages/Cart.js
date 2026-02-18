import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { couponsAPI } from '../services/api';
import { showToast } from '../components/UI/Toast';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateTotals
  } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [suggestedCoupons, setSuggestedCoupons] = useState([]);
  const totals = calculateTotals();

  useEffect(() => {
    if (cart?.items?.length > 0) {
      fetchSuggestedCoupons();
    }
  }, [cart, appliedCoupon]);

  const fetchSuggestedCoupons = async () => {
    try {
      const response = await couponsAPI.getSuggested(appliedCoupon?.code || '');
      setSuggestedCoupons(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggested coupons:', error);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      showToast(result.error);
    }
  };

  const handleRemove = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      showToast('Item removed from cart');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const response = await couponsAPI.validate(couponCode, totals.subtotal);
      if (response.data.valid) {
        applyCoupon(response.data);
        showToast(`Coupon ${couponCode} applied!`);
        setCouponCode('');
      } else {
        showToast(response.data.message || 'Invalid coupon');
      }
    } catch (error) {
      showToast('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplySuggestedCoupon = async (code) => {
    setCouponCode(code);
    try {
      const response = await couponsAPI.validate(code, totals.subtotal);
      if (response.data.valid) {
        applyCoupon(response.data);
        showToast(`Coupon ${code} applied!`);
        setCouponCode('');
      }
    } catch (error) {
      showToast('Failed to apply coupon');
    }
  };

  const getEligibilityClass = (eligibility) => {
    switch (eligibility) {
      case 'applicable': return 'applicable';
      case 'almost': return 'almost';
      default: return 'not-applicable';
    }
  };

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="section-title">🛒 Your Cart</h1>

      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">{item.product.emoji}</div>
            <div className="cart-item-details">
              <h3>{item.product.name}</h3>
              <p className="cart-item-price">
                ₹{parseFloat(item.product.discounted_price).toFixed(0)}
                {item.product.has_discount && (
                  <>
                    <span className="original-price">₹{item.product.price}</span>
                    <span className="item-discount-badge">-{item.product.discount_percent}%</span>
                  </>
                )}
              </p>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={loading}
                >
                  -
                </button>
                <span style={{ padding: '0 1rem' }}>{item.quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={loading}
                >
                  +
                </button>
              </div>
              <button 
                className="btn-remove"
                onClick={() => handleRemove(item.id)}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Offers */}
      {suggestedCoupons.length > 0 && (
        <div className="offers-suggestion-section">
          <h3>💡 Recommended Offers</h3>
          <div className="offers-grid">
            {suggestedCoupons.slice(0, 3).map(offer => (
              <div key={offer.code} className={`offer-card ${getEligibilityClass(offer.eligibility)}`}>
                <div className="offer-header">
                  <span className={`offer-badge ${getEligibilityClass(offer.eligibility)}`}>
                    {offer.eligibility === 'applicable' ? 'Applicable' : 
                     offer.eligibility === 'almost' ? 'Almost There' : 'Locked'}
                  </span>
                </div>
                <div className="offer-content">
                  <h4>{offer.code}</h4>
                  <p className="offer-description">{offer.description}</p>
                  {offer.potential_discount > 0 && (
                    <p className="savings-amount">Save ₹{offer.potential_discount.toFixed(0)}</p>
                  )}
                  {offer.eligibility === 'almost' && (
                    <div className="offer-progress">
                      <p className="progress-text">Add ₹{offer.amount_needed.toFixed(0)} more</p>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${100 - offer.percentage_to_go}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                {offer.eligibility === 'applicable' && !offer.is_applied && (
                  <button 
                    className="btn-apply-offer"
                    onClick={() => handleApplySuggestedCoupon(offer.code)}
                  >
                    Apply Offer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cart-summary">
        <h3>Order Summary</h3>
        
        {/* Coupon Section */}
        <div className="coupon-section">
          {appliedCoupon ? (
            <div className="applied-coupon-info">
              <p>✓ {appliedCoupon.coupon.code} applied</p>
              <p style={{ fontSize: '0.9rem' }}>You save ₹{appliedCoupon.discount.toFixed(0)}</p>
              <button 
                onClick={removeCoupon}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="coupon-input-wrapper">
              <input
                type="text"
                id="couponInput"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button 
                className="btn-coupon"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
          )}
        </div>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (8%)</span>
          <span>₹{totals.tax.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <span>{totals.delivery === 0 ? 'FREE' : `₹${totals.delivery.toFixed(2)}`}</span>
        </div>
        {appliedCoupon && (
          <div className="summary-row discount-row">
            <span>Coupon Discount</span>
            <span>-₹{totals.couponDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{totals.total.toFixed(2)}</span>
        </div>

        <div className="cart-actions">
          <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
          <button 
            className="btn-primary"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
