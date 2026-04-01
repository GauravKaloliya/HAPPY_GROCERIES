import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ordersAPI } from '../api/orders';
import {
  fetchCart,
  selectCartItems,
  selectCartLoading,
  selectCartSubtotal,
  selectCartTax,
  selectDeliveryCharge,
  selectDiscount,
  clearCartState,
  selectAppliedCoupon,
  clearCoupon,
} from '../store/slices/cartSlice';
import { selectUser } from '../store/slices/authSlice';
import { selectExpressDeliveryCharge, selectFreeDeliveryThreshold } from '../store/slices/configSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const CHECKOUT_SESSION_KEY = 'checkout-delivery-session';
const initialDeliveryInfo = {
  name: '',
  phone: '',
  address: '',
  city: '',
  deliveryType: 'standard',
};

const getInitialDeliveryInfo = () => {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!raw) {
      return initialDeliveryInfo;
    }

    const parsed = JSON.parse(raw);
    return {
      ...initialDeliveryInfo,
      ...parsed,
    };
  } catch {
    return initialDeliveryInfo;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const isSubmittingRef = useRef(false);

  const user = useSelector(selectUser);
  const items = useSelector(selectCartItems);
  const cartLoading = useSelector(selectCartLoading);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const baseDelivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const expressCharge = useSelector(selectExpressDeliveryCharge);
  const freeDeliveryThreshold = useSelector(selectFreeDeliveryThreshold);

  const { logCustomActivity } = useActivityLog('page_view', { section: 'checkout' });

  const [deliveryInfo, setDeliveryInfo] = useState(getInitialDeliveryInfo);

  useEffect(() => {
    let active = true;

    dispatch(fetchCart())
      .catch(() => null)
      .finally(() => {
        if (active) {
          setCartReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(deliveryInfo));
  }, [deliveryInfo]);

  const deliveryCharge = deliveryInfo.deliveryType === 'express'
    ? expressCharge
    : baseDelivery;

  const computedTotal = (() => {
    const sub = parseFloat(subtotal) || 0;
    const taxAmt = parseFloat(tax) || 0;
    const disc = parseFloat(discount) || 0;
    const delCharge = parseFloat(deliveryInfo.deliveryType === 'express' ? expressCharge : baseDelivery) || 0;
    const base = sub + taxAmt - disc;
    return Math.max(0, base + delCharge);
  })();

  const appliedCouponMinOrder = Number(appliedCoupon?.min_order_value ?? 0);
  const hasValidAppliedCoupon = Boolean(
    appliedCoupon?.code && (parseFloat(subtotal) || 0) >= appliedCouponMinOrder
  );

  if ((!cartReady || cartLoading) && !orderSuccess) {
    return <PageLoader />;
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="container">
        <div className="empty-state cart-empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some items before checking out</p>
          <Link to="/shop" className="btn-primary">
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

          // Try to find the actual city, avoiding subdistricts/talukas and countries
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
              // Skip country, postal code, taluka/subdistrict, and India
              if (part.match(/^\d{5,6}$/) || // postal code
                  part.length < 3 || // too short
                  part.toLowerCase().includes('taluka') ||
                  part.toLowerCase().includes('tehsil') ||
                  part.toLowerCase() === 'india') {
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

          // If still showing "India" as city, don't set it
          if (city.toLowerCase() === 'india') {
            city = '';
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
    if (loading || isSubmittingRef.current) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!items.length) {
      toast.error('No valid items in cart. Please add items to your cart.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    try {
      if (appliedCoupon?.code && !hasValidAppliedCoupon) {
        dispatch(clearCoupon());
        toast('Coupon removed because your order is below its minimum amount.');
      }

      const orderData = {
        // Let backend use authenticated user's cart snapshot.
        delivery_address: `${deliveryInfo.address}, ${deliveryInfo.city}`,
        delivery_phone: deliveryInfo.phone,
        delivery_name: deliveryInfo.name,
        delivery_type: deliveryInfo.deliveryType,
        coupon_code: hasValidAppliedCoupon ? appliedCoupon.code : null,
      };

      const response = await ordersAPI.create(orderData);
      setOrderId(response.data.id || response.data.order_id);
      setOrderSuccess(true);
      sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
      dispatch(clearCartState());
      void logCustomActivity('checkout', { order_id: response.data.id, total: computedTotal, items_count: items.length });
    } catch (error) {
      const responseData = error.response?.data;
      const errorMsg =
        responseData?.error?.message
        || responseData?.error
        || responseData?.detail
        || responseData?.message
        || (typeof responseData === 'string' ? responseData : null)
        || 'Failed to place order';
      toast.error(errorMsg);
      console.error('Order error:', error.response?.data);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
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
          <div className="modal-icon">🥳</div>
          <h2>hurrah your order successfully placed !</h2>
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
    <div className="container">
    <div className="checkout-mobile">
      <div className="checkout-mobile-topbar">
        <Link to="/cart" className="checkout-mobile-back">←</Link>
        <div className="checkout-mobile-title">
          <span>Checkout</span>
          <small>Verify delivery & pay</small>
        </div>
        <div className="checkout-mobile-pill">{formatPrice(computedTotal)}</div>
      </div>

      <div className="checkout-mobile-card checkout-mobile-address">
        <div className="checkout-mobile-card-head">
          <h3>Delivery Details</h3>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={fetchingLocation}
            className="checkout-mobile-location-btn"
          >
            {fetchingLocation ? '⏳' : '📍'}
          </button>
        </div>

        <div className="checkout-mobile-grid">
          <label className="checkout-mobile-field">
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              value={deliveryInfo.name}
              onChange={handleInputChange}
              placeholder="Your full name"
            />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </label>

          <label className="checkout-mobile-field">
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value={deliveryInfo.phone}
              onChange={handleInputChange}
              placeholder="10-digit phone"
              maxLength="10"
            />
            {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
          </label>
        </div>

        <label className="checkout-mobile-field">
          <span>Address</span>
          <textarea
            name="address"
            value={deliveryInfo.address}
            onChange={handleInputChange}
            placeholder="House, Street, Landmark"
            rows="3"
          />
          {fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}
        </label>

        <label className="checkout-mobile-field">
          <span>City</span>
          <input
            type="text"
            name="city"
            value={deliveryInfo.city}
            onChange={handleInputChange}
            placeholder="Your city"
          />
          {fieldErrors.city && <div className="field-error">{fieldErrors.city}</div>}
        </label>
      </div>

      <div className="checkout-mobile-card checkout-mobile-delivery">
        <h3>Delivery Speed</h3>
        <div className="checkout-mobile-options">
          <label className={`checkout-mobile-option ${deliveryInfo.deliveryType === 'standard' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="deliveryType"
              value="standard"
              checked={deliveryInfo.deliveryType === 'standard'}
              onChange={handleInputChange}
            />
            <span>
              <strong>Standard</strong>
              <small>{subtotal >= freeDeliveryThreshold ? 'Free delivery' : `₹${baseDelivery} delivery charge`}</small>
            </span>
            <em>30-45 mins</em>
          </label>
          <label className={`checkout-mobile-option ${deliveryInfo.deliveryType === 'express' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="deliveryType"
              value="express"
              checked={deliveryInfo.deliveryType === 'express'}
              onChange={handleInputChange}
            />
            <span>
              <strong>Express</strong>
              <small>+₹{expressCharge} delivery charge</small>
            </span>
            <em>10-15 mins</em>
          </label>
        </div>
      </div>

      <div className="checkout-mobile-card checkout-mobile-items-card">
        <h3>Your Items</h3>
        <div className="checkout-mobile-items">
          {items.map((item) => (
            <div key={item.id} className="checkout-mobile-item">
              <div className="checkout-mobile-item-left">
                <span className="checkout-mobile-item-emoji">{item.product?.emoji || '🛒'}</span>
                <div>
                  <strong>{item.product.name}</strong>
                  <div className="checkout-mobile-item-meta">
                    x{item.quantity} • {item.product?.default_variant?.variant_name || 'Default'}
                  </div>
                </div>
              </div>
              <span className="checkout-mobile-item-price">
                {formatPrice((item.product.effective_price || item.product.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="checkout-mobile-card checkout-mobile-summary">
        <h3>Payment Summary</h3>
        <div className="checkout-mobile-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="checkout-mobile-row discount-row">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="checkout-mobile-row">
          <span>Tax (8%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="checkout-mobile-row">
          <span>Delivery</span>
          <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
        </div>
        <div className="checkout-mobile-row total">
          <span>Total</span>
          <span>{formatPrice(computedTotal)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="checkout-mobile-cta"
        disabled={loading || !isFormValid()}
      >
        {loading ? 'Placing Order...' : `Place Order • ${formatPrice(computedTotal)}`}
      </button>
    </div>

    <div className="checkout-container checkout-desktop">
      <div className="checkout-form">
        <h2>Delivery Information</h2>

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
          <div className="checkout-location-header">
            <label>Delivery Address</label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={fetchingLocation}
              className="btn-location checkout-location-btn"
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
                  {subtotal >= freeDeliveryThreshold ? 'FREE delivery' : `₹${baseDelivery} delivery charge`}
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
                <strong>Express Delivery (+₹{expressCharge})</strong>
                <small>Get it within 10 minutes</small>
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="btn-submit"
          disabled={loading || !isFormValid()}

        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>

        <div>
          {items.map((item) => (
            <div key={item.id} className="checkout-order-item">
              <div className="checkout-order-item-main">
                <span>{item.product.name} x {item.quantity}</span>
                <small className="checkout-order-item-meta">
                  {[
                    item.product?.default_variant?.variant_name,
                    item.product?.default_variant?.sku && `SKU: ${item.product.default_variant.sku}`,
                    item.product?.default_variant?.unit_type && item.product?.default_variant?.unit_value
                      ? `${item.product.default_variant.unit_value} ${item.product.default_variant.unit_type}`
                      : item.product?.default_variant?.unit_type || null,
                  ].filter(Boolean).join(' • ') || 'Default variant'}
                </small>
              </div>
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
    </div>
  );
};

export default Checkout;
