import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { couponsAPI } from '../api/coupons';
import { categoriesAPI } from '../api/categories';
import { ordersAPI } from '../api/orders';
import { selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Offers = () => {
  const [coupons, setCoupons] = useState([]);
  const [displayedCoupons, setDisplayedCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasOrders, setHasOrders] = useState(false);
  const COUPONS_LIMIT = 6;
  const cartTotal = useSelector(selectCartSubtotal);
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useActivityLog('page_view', { section: 'offers' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [couponsRes, categoriesRes] = await Promise.all([
          couponsAPI.getAll({ limit: COUPONS_LIMIT }),
          categoriesAPI.getAll(),
        ]);
        const data = couponsRes.data;
        const allCoupons = data.results || data;
        const total = data.count !== undefined ? data.count : allCoupons.length;
        setCoupons(allCoupons);
        setDisplayedCoupons(allCoupons);
        setCategories(categoriesRes.data.results || categoriesRes.data);
        setHasMore(total > allCoupons.length || allCoupons.length >= COUPONS_LIMIT);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleViewMore = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const currentLength = displayedCoupons.length;
      const params = { limit: COUPONS_LIMIT, offset: currentLength };
      const couponsRes = await couponsAPI.getAll(params);
      const data = couponsRes.data;
      const newCoupons = data.results || data;
      const total = data.count !== undefined ? data.count : null;

      if (newCoupons.length > 0) {
        const updated = [...displayedCoupons, ...newCoupons];
        setDisplayedCoupons(updated);
        setCoupons(updated);
        if (total !== null) {
          setHasMore(updated.length < total);
        } else {
          setHasMore(newCoupons.length >= COUPONS_LIMIT);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more coupons:', error);
      toast.error('Failed to load more coupons');
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleCopyCode = (code, coupon) => {
    if (!isCouponApplicableToCart(coupon)) {
      toast.error('This coupon is not applicable to your cart');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Coupon ${code} copied to clipboard! 📋`);
    }).catch(() => {
      toast.error('Failed to copy code');
    });
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setDisplayedCoupons(coupons);
    setHasMore(coupons.length >= COUPONS_LIMIT);
  };

  const cartCategories = new Set(
    (cartItems || [])
      .map((item) => item?.product?.category?.name)
      .filter(Boolean)
  );

  const isCouponApplicableToCart = (coupon) => {
    if (coupon.first_order_only && !isAuthenticated) {
      return false;
    }
    if (coupon.first_order_only && hasOrders) {
      return false;
    }
    const applicable = coupon.applicable_categories || [];
    if (Array.isArray(applicable) && applicable.length > 0) {
      if (cartCategories.size === 0) return false;
      return applicable.some((cat) => cartCategories.has(cat));
    }
    return true;
  };

  const getEligibilityStatus = (coupon) => {
    if (!isCouponApplicableToCart(coupon)) {
      if (coupon.first_order_only && !isAuthenticated) {
        return { status: 'locked', text: 'Login for First Order', icon: '🔒' };
      }
      if (coupon.first_order_only && hasOrders) {
        return { status: 'locked', text: 'First Order Only', icon: '🔒' };
      }
      return { status: 'locked', text: 'Not for your cart', icon: '🔒' };
    }
    if (cartTotal >= coupon.min_order_value) {
      return { status: 'applicable', text: 'Ready to Use', icon: '✅' };
    }
    const shortfall = coupon.min_order_value - cartTotal;
    if (shortfall <= 100) {
      return { status: 'almost', text: 'Almost There!', icon: '⚠️' };
    }
    return { status: 'locked', text: 'Locked', icon: '🔒' };
  };

  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredCoupons = activeCategory === 'all'
    ? displayedCoupons
    : displayedCoupons.filter(c => c.applicable_categories?.includes(activeCategory) || c.coupon_type === 'percentage');

  const couponsList = filteredCoupons
    .filter(c => c.is_active);
  const showViewMore = hasMore;

  if (loading) return <PageLoader />;

  return (
    <div className="container offers-container offers-page">
      <h1 className="section-title">🎉 Offers & Coupons</h1>

      {/* Hero Banner */}
      <div className="offers-header">
        <h2>Save Big on Your Groceries!</h2>
        <p>
          Apply these coupons at checkout and enjoy amazing discounts on your favorite products.
        </p>
        {cartTotal > 0 && (
          <div className="offers-header-total">
            <p>Your current cart total: <strong>₹{cartTotal.toFixed(2)}</strong></p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="offers-category-filter">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`offers-category-button ${activeCategory === 'all' ? 'active' : ''}`}
        >
          All Coupons
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            onClick={() => handleCategoryChange(cat.name)}
            className={`offers-category-button ${activeCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      {couponsList.length === 0 ? (
      <div className="empty-state">
      <div className="empty-state-icon">🎫</div>
      <h3>No coupons available</h3>
      <p>Check back later for exciting offers!</p>
      </div>
      ) : (
      <>
      <div className="coupons-list">
        {couponsList.map((coupon) => {
              const eligibility = getEligibilityStatus(coupon);
              const daysLeft = coupon.valid_until ? calculateDaysLeft(coupon.valid_until) : null;
              const isExpiringSoon = daysLeft !== null && daysLeft <= 7;
              const canCopy = eligibility.status === 'applicable';

              return (
                <div
                  key={coupon.code}
                  className={`coupon-card ${eligibility.status}`}
                >
                  <div className="coupon-header">
                    <h3 className="coupon-code">{coupon.code}</h3>
                    {coupon.first_order_only && (
                      <span className="coupon-tag">First Order Only</span>
                    )}
                  </div>

                  <div className="coupon-body">
                    <p className="coupon-description">
                      {coupon.description}
                    </p>

                    <div className={`coupon-eligibility ${eligibility.status}`}>
                      {eligibility.icon} {eligibility.text}
                    </div>

                    {eligibility.status === 'almost' && (
                      <div className="coupon-almost">
                        <p>
                          Add ₹{(coupon.min_order_value - cartTotal).toFixed(0)} more to unlock this offer!
                        </p>
                      </div>
                    )}

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
                      <div className="coupon-info-item">
                        <strong>Expires:</strong>
                        <span className={isExpiringSoon ? 'coupon-expiring' : ''}>
                          {coupon.valid_until
                            ? (isExpiringSoon ? `${daysLeft} days left!` : new Date(coupon.valid_until).toLocaleDateString())
                            : 'No expiry'}
                        </span>
                      </div>
                      {coupon.applicable_categories?.length > 0 && (
                        <div className="coupon-info-item">
                          <strong>Valid for:</strong>
                          <span>{coupon.applicable_categories.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="coupon-footer">
                    <button
                      onClick={() => handleCopyCode(coupon.code, coupon)}
                      className={`btn-copy-coupon ${canCopy ? '' : 'disabled'}`}
                      disabled={!canCopy}
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {showViewMore && (
            <div className="view-more-wrapper">
              <button
                className="btn-primary"
                onClick={handleViewMore}
                disabled={isFetchingMore}
              >
                {isFetchingMore ? 'Loading...' : 'View More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* How to Use */}
      <div className="offers-how-to">
        <h3>📖 How to Use Coupons</h3>
        <div className="offers-how-to-grid">
          {[
            { step: '1', title: 'Copy Code', desc: 'Click the "Copy Code" button on any coupon' },
            { step: '2', title: 'Shop Products', desc: 'Add your favorite items to the cart' },
            { step: '3', title: 'Apply at Checkout', desc: 'Paste the code in the coupon field during checkout' },
            { step: '4', title: 'Enjoy Savings!', desc: 'Watch the discount apply to your order total' },
          ].map((item) => (
            <div key={item.step} className="offers-how-step">
              <div className="offers-how-step-number">
                {item.step}
              </div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="offers-terms">
        <h4>Terms & Conditions</h4>
        <ul>
          <li>Coupons cannot be combined with other offers</li>
          <li>Each coupon can be used only once per user</li>
          <li>Coupons are valid until the expiry date mentioned</li>
          <li>Minimum order value must be met before tax and delivery charges</li>
          <li>Happy Groceries reserves the right to modify or cancel any coupon</li>
        </ul>
      </div>
    </div>
  );
};

export default Offers;
