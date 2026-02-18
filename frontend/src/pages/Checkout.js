import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ordersAPI } from '../services/api';
import { showToast } from '../components/UI/Toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, appliedCoupon, calculateTotals, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryType: 'standard'
  });

  const totals = calculateTotals();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        delivery_name: formData.name,
        delivery_phone: formData.phone,
        delivery_address: formData.address,
        delivery_type: formData.deliveryType,
        coupon_code: appliedCoupon?.coupon?.code || ''
      };

      const response = await ordersAPI.create(orderData);
      setOrderDetails(response.data.order);
      setShowModal(true);
      clearCart();
    } catch (error) {
      showToast('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/orders');
  };

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products before checkout!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">📦 Checkout</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Delivery Form */}
        <div className="checkout-form" style={{
          background: 'var(--bg-white)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)'
        }}>
          <h2>Delivery Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter your complete address"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Delivery Type</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="standard"
                    checked={formData.deliveryType === 'standard'}
                    onChange={handleInputChange}
                  />
                  Standard (₹50 or FREE over ₹500)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="express"
                    checked={formData.deliveryType === 'express'}
                    onChange={handleInputChange}
                  />
                  Express (₹100)
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary" style={{
          background: 'var(--bg-white)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          height: 'fit-content'
        }}>
          <h2>Order Summary</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            {cart.items.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
              }}>
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
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
            <span>
              {formData.deliveryType === 'express' ? '₹100' : 
               totals.delivery === 0 ? 'FREE' : `₹${totals.delivery.toFixed(2)}`}
            </span>
          </div>
          {appliedCoupon && (
            <div className="summary-row discount-row">
              <span>Coupon Discount</span>
              <span>-₹{totals.couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
            <span>Total</span>
            <span>
              ₹{(totals.total + (formData.deliveryType === 'express' && totals.subtotal >= 500 ? 100 : 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal show" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order <strong>#{orderDetails?.id}</strong> has been confirmed.</p>
            <p>Estimated delivery: {orderDetails?.estimated_delivery}</p>
            <button className="btn-close-modal" onClick={handleCloseModal}>
              View Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
