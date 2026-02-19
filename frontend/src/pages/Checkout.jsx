import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ordersAPI } from '../api/orders';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTax,
  selectDeliveryCharge,
  selectDiscount,
  clearCartState,
  selectAppliedCoupon,
} from '../store/slices/cartSlice';
import { selectUser } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../utils/constants';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const EXPRESS_CHARGE = 50;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const user = useSelector(selectUser);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const baseDelivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const appliedCoupon = useSelector(selectAppliedCoupon);

  const { logCustomActivity } = useActivityLog('page_view', { section: 'checkout' });

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    deliveryType: 'standard',
  });

  useEffect(() => {
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const deliveryCharge = deliveryInfo.deliveryType === 'express'
    ? EXPRESS_CHARGE
    : baseDelivery;

  const computedTotal = (() => {
    const base = subtotal + tax - discount;
    if (deliveryInfo.deliveryType === 'express') {
      return Math.max(0, base + EXPRESS_CHARGE);
    }
    return Math.max(0, base + baseDelivery);
  })();

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
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          
          // Improved city detection - prioritize city/district over county/subdistrict
          const addr = data.address || {};
          let city = '';
          
          // Try to find the actual city, avoiding subdistricts/talukas
          if (addr.city) {
            city = addr.city;
          } else if (addr.town) {
            city = addr.town;
          } else if (addr.district && !addr.district.toLowerCase().includes('taluka') && !addr.district.toLowerCase().includes('tehsil')) {
            city = addr.district;
          } else if (addr.county && !addr.county.toLowerCase().includes('taluka') && !addr.county.toLowerCase().includes('tehsil')) {
            city = addr.county;
          } else if (addr.village) {
            city = addr.village;
          }
          
          // If still no city, try to extract from display_name
          if (!city && address) {
            const parts = address.split(',').map(p => p.trim());
            // Look for common patterns - usually city is 2-3rd from last before state/postal
            for (let i = parts.length - 1; i >= 0; i--) {
              const part = parts[i];
              // Skip country, postal code, and taluka/subdistrict
              if (part.match(/^\d{5,6}$/) || // postal code
                  part.length < 3 || // too short
                  part.toLowerCase().includes('taluka') ||
                  part.toLowerCase().includes('tehsil')) {
                continue;
              }
              // Check if this looks like a state (2-3 words, common Indian states)
              const states = ['gujarat', 'maharashtra', 'rajasthan', 'punjab', 'haryana', 'delhi', 'karnataka', 'tamil nadu', 'kerala', 'andhra pradesh', 'telangana', 'west bengal', 'bihar', 'jharkhand', 'odisha', 'chhattisgarh', 'madhya pradesh', 'uttar pradesh', 'uttarakhand', 'himachal pradesh', 'jammu and kashmir', 'goa', 'assam', 'meghalaya', 'manipur', 'mizoram', 'nagaland', 'tripura', 'sikkim', 'arunachal pradesh'];
              if (states.some(s => part.toLowerCase().includes(s))) {
                continue;
              }
              // This might be the city - but prefer earlier matches (more specific)
              if (!city) {
                city = part;
              }
            }
          }
          
          setDeliveryInfo(prev => ({
            ...prev,
            address,
            city,
          }));
          setFieldErrors(prev => ({ ...prev, address: '', city: '' }));
          toast.success('Location fetched successfully! 📍');
        } catch {
          toast.error('Failed to fetch address from location');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        setFetchingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow access.');
        } else {
          toast.error('Failed to get location');
        }
      }
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!deliveryInfo.name.trim()) errors.name = 'Full name is required';
    if (!deliveryInfo.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(deliveryInfo.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number';
    if (!deliveryInfo.address.trim()) errors.address = 'Delivery address is required';
    if (!deliveryInfo.city.trim()) errors.city = 'City is required';
    return errors;
  };

  const handlePlaceOrder = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
        delivery_charge: deliveryCharge,
        discount,
        total: computedTotal,
        coupon_code: appliedCoupon?.code || null,
      };

      const response = await ordersAPI.create(orderData);
      setOrderId(response.data.id || response.data.order_id);
      setOrderSuccess(true);
      dispatch(clearCartState());
      logCustomActivity('checkout', { order_id: response.data.id, total: computedTotal, items_count: items.length });
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      deliveryInfo.name.trim() &&
      deliveryInfo.phone.trim() &&
      deliveryInfo.address.trim() &&
      deliveryInfo.city.trim()
    );
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
          />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={deliveryInfo.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            maxLength="10"
          />
          {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ margin: 0 }}>Delivery Address</label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={fetchingLocation}
              style={{
                background: 'var(--primary-pink)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: fetchingLocation ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {fetchingLocation ? '⏳ Fetching...' : '📍 Use My Location'}
            </button>
          </div>
          <textarea
            name="address"
            value={deliveryInfo.address}
            onChange={handleInputChange}
            placeholder="Enter your complete address"
            rows="3"
          />
          {fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={deliveryInfo.city}
            onChange={handleInputChange}
            placeholder="Enter your city"
          />
          {fieldErrors.city && <div className="field-error">{fieldErrors.city}</div>}
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
                <small>
                  {subtotal >= FREE_DELIVERY_THRESHOLD ? 'FREE delivery' : `₹${DELIVERY_CHARGE} delivery charge`}
                </small>
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
                <strong>Express Delivery (+₹{EXPRESS_CHARGE})</strong>
                <small>Get it within 2 hours</small>
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="btn-submit"
          disabled={loading || !isFormValid()}
          style={{
            marginTop: '1rem',
            opacity: isFormValid() ? 1 : 0.5,
            cursor: isFormValid() ? 'pointer' : 'not-allowed',
          }}
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
              <span>{formatPrice((item.product.effective_price || item.product.price) * item.quantity)}</span>
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
            {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
          </span>
        </div>

        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(computedTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
