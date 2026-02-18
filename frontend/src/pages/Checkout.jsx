import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ordersAPI } from '../api/orders';
import {
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  selectCartTax,
  selectDeliveryCharge,
  selectDiscount,
  clearCartState,
  selectAppliedCoupon,
} from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const delivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);
  const appliedCoupon = useSelector(selectAppliedCoupon);

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    deliveryType: 'standard',
  });

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some items before checking out</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Go Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    const required = ['name', 'phone', 'address', 'city'];
    if (!required.every(field => deliveryInfo[field].trim() !== '')) {
      toast.error('Please fill in all delivery information');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.effective_price || item.product.price,
        })),
        delivery_address: `${deliveryInfo.address}, ${deliveryInfo.city}`,
        delivery_phone: deliveryInfo.phone,
        delivery_name: deliveryInfo.name,
        delivery_type: deliveryInfo.deliveryType,
        subtotal,
        tax,
        delivery_charge: delivery,
        discount,
        total,
        coupon_code: appliedCoupon?.code || null,
      };

      const response = await ordersAPI.create(orderData);
      setOrderId(response.data.id);
      setOrderSuccess(true);
      dispatch(clearCartState());
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="modal show">
        <div className="modal-content">
          <div className="modal-icon">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your order.</p>
          <p>Order ID: <strong>{orderId}</strong></p>
          <p>We'll deliver your groceries with love! 💚</p>
          <button onClick={() => navigate('/orders')} className="btn-close-modal">
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <PageLoader />;

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2 style={{ marginBottom: '1.5rem' }}>Delivery Information</h2>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={deliveryInfo.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={deliveryInfo.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label>Delivery Address</label>
          <textarea
            name="address"
            value={deliveryInfo.address}
            onChange={handleInputChange}
            placeholder="Enter your complete address"
            required
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={deliveryInfo.city}
            onChange={handleInputChange}
            placeholder="Enter your city"
            required
          />
        </div>

        <div className="form-group">
          <label>Delivery Option</label>
          <div className="delivery-options">
            <label className={`delivery-option ${deliveryInfo.deliveryType === 'standard' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="deliveryType"
                value="standard"
                checked={deliveryInfo.deliveryType === 'standard'}
                onChange={handleInputChange}
              />
              <span className="delivery-option-text">
                <strong>Standard Delivery</strong>
                <small>Free delivery on orders over $50</small>
              </span>
            </label>
            <label className={`delivery-option ${deliveryInfo.deliveryType === 'express' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="deliveryType"
                value="express"
                checked={deliveryInfo.deliveryType === 'express'}
                onChange={handleInputChange}
              />
              <span className="delivery-option-text">
                <strong>Express Delivery (+$5)</strong>
                <small>Get it within 2 hours</small>
              </span>
            </label>
          </div>
        </div>

        <button 
          onClick={handlePlaceOrder} 
          className="btn-submit"
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>

      <div className="order-summary">
        <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <span>{item.product.name} x {item.quantity}</span>
              <span>{formatPrice((item.product.discount_price || item.product.price) * item.quantity)}</span>
            </div>
          ))}
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
          <span>
            {deliveryInfo.deliveryType === 'express' 
              ? formatPrice(5) 
              : (delivery === 0 ? 'FREE' : formatPrice(delivery))}
          </span>
        </div>

        <div className="summary-row total">
          <span>Total</span>
          <span>
            {formatPrice(total + (deliveryInfo.deliveryType === 'express' && delivery === 0 ? 5 : 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
