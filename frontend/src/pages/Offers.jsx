import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { couponsAPI } from '../api/coupons';
import { categoriesAPI } from '../api/categories';
import { selectCartSubtotal } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const COUPONS_PER_PAGE = 6;

const Offers = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const cartTotal = useSelector(selectCartSubtotal);

  useActivityLog('page_view', { section: 'offers' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [couponsRes, categoriesRes] = await Promise.all([
          couponsAPI.getAll(),
          categoriesAPI.getAll(),
        ]);
        setCoupons(couponsRes.data.results || couponsRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Coupon ${code} copied to clipboard! 📋`);
    }).catch(() => {
      toast.error('Failed to copy code');
    });
  };

  const getEligibilityStatus = (coupon) => {
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
    ? coupons 
    : coupons.filter(c => c.applicable_categories?.includes(activeCategory) || c.coupon_type === 'percentage');

  // Pagination logic
  const totalPages = Math.ceil(filteredCoupons.filter(c => c.is_active).length / COUPONS_PER_PAGE);
  const startIndex = (currentPage - 1) * COUPONS_PER_PAGE;
  const endIndex = startIndex + COUPONS_PER_PAGE;
  const displayedCoupons = filteredCoupons.filter(c => c.is_active).slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="container">
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
          onClick={() => setActiveCategory('all')}
          className={`offers-category-button ${activeCategory === 'all' ? 'active' : ''}`}
        >
          All Coupons
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`offers-category-button ${activeCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No coupons available</h3>
          <p>Check back later for exciting offers!</p>
        </div>
      ) : (
        <>
          <div className="coupons-list">
            {displayedCoupons.map((coupon) => {
              const eligibility = getEligibilityStatus(coupon);
              const daysLeft = coupon.valid_until ? calculateDaysLeft(coupon.valid_until) : null;
              const isExpiringSoon = daysLeft !== null && daysLeft <= 7;

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
                      onClick={() => handleCopyCode(coupon.code)}
                      className="btn-copy-coupon"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* How to Use */}
      <div style={{
        background: 'var(--bg-white)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        boxShadow: 'var(--shadow)',
        marginBottom: '3rem',
      }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>📖 How to Use Coupons</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
        }}>
          {[
            { step: '1', title: 'Copy Code', desc: 'Click the "Copy Code" button on any coupon' },
            { step: '2', title: 'Shop Products', desc: 'Add your favorite items to the cart' },
            { step: '3', title: 'Apply at Checkout', desc: 'Paste the code in the coupon field during checkout' },
            { step: '4', title: 'Enjoy Savings!', desc: 'Watch the discount apply to your order total' },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--primary-pink)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 auto 1rem',
              }}>
                {item.step}
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>{item.title}</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div style={{
        background: 'var(--bg-light)',
        borderRadius: 'var(--border-radius)',
        padding: '1.5rem',
        fontSize: '0.9rem',
        color: '#666',
      }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Terms & Conditions</h4>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
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
