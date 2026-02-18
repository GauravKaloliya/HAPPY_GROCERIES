import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { couponsAPI } from '../api/coupons';
import { categoriesAPI } from '../api/categories';
import { selectCartSubtotal } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';

const Offers = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const cartTotal = useSelector(selectCartSubtotal);

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
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredCoupons = activeCategory === 'all' 
    ? coupons 
    : coupons.filter(c => c.applicable_categories?.includes(activeCategory) || c.coupon_type === 'percentage');

  if (loading) return <PageLoader />;

  return (
    <div className="container">
      <h1 className="section-title">🎉 Offers & Coupons</h1>

      {/* Hero Banner */}
      <div className="offers-header" style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-blue) 100%)',
        borderRadius: 'var(--border-radius)',
        color: 'white',
      }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Save Big on Your Groceries!</h2>
        <p style={{ fontSize: '1.2rem', margin: 0 }}>
          Apply these coupons at checkout and enjoy amazing discounts on your favorite products.
        </p>
        {cartTotal > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--border-radius)' }}>
            <p style={{ margin: 0 }}>Your current cart total: <strong>₹{cartTotal.toFixed(2)}</strong></p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: '2px solid var(--primary-pink)',
            background: activeCategory === 'all' ? 'var(--primary-pink)' : 'transparent',
            color: activeCategory === 'all' ? 'white' : 'var(--text-dark)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'var(--transition)',
          }}
        >
          All Coupons
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '2px solid var(--primary-pink)',
              background: activeCategory === cat.name ? 'var(--primary-pink)' : 'transparent',
              color: activeCategory === cat.name ? 'white' : 'var(--text-dark)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'var(--transition)',
            }}
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          {filteredCoupons.filter(c => c.active).map((coupon) => {
            const eligibility = getEligibilityStatus(coupon);
            const daysLeft = calculateDaysLeft(coupon.expiry_date || coupon.valid_until);
            const isExpiringSoon = daysLeft <= 7;

            return (
              <div
                key={coupon.code}
                style={{
                  background: 'var(--bg-white)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow)',
                  overflow: 'hidden',
                  transition: 'var(--transition)',
                  border: `2px solid ${
                    eligibility.status === 'applicable' ? 'var(--primary-green)' : 
                    eligibility.status === 'almost' ? 'var(--primary-yellow)' : '#ddd'
                  }`,
                }}
              >
                {/* Header */}
                <div style={{
                  background: 'var(--primary-pink)',
                  color: 'white',
                  padding: '1.5rem',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '3px', margin: 0 }}>
                    {coupon.code}
                  </h3>
                  {coupon.first_order_only && (
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--primary-yellow)',
                      color: 'var(--text-dark)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginTop: '0.5rem',
                    }}>
                      First Order Only
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-dark)' }}>
                    {coupon.description}
                  </p>

                  {/* Eligibility Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    background: 
                      eligibility.status === 'applicable' ? 'var(--primary-green)' :
                      eligibility.status === 'almost' ? 'var(--primary-yellow)' : '#ddd',
                    color: eligibility.status === 'locked' ? '#666' : 'var(--text-dark)',
                  }}>
                    {eligibility.icon} {eligibility.text}
                  </div>

                  {eligibility.status === 'almost' && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-light)', borderRadius: 'var(--border-radius)' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Add ₹{(coupon.min_order_value - cartTotal).toFixed(0)} more to unlock this offer!
                      </p>
                    </div>
                  )}

                  {/* Coupon Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #ddd' }}>
                      <strong>Minimum Order:</strong>
                      <span>₹{coupon.min_order_value}</span>
                    </div>
                    {coupon.coupon_type === 'percentage' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #ddd' }}>
                        <strong>Max Discount:</strong>
                        <span>₹{coupon.max_discount}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #ddd' }}>
                      <strong>Expires:</strong>
                      <span style={{ color: isExpiringSoon ? '#ff4444' : 'inherit', fontWeight: isExpiringSoon ? 700 : 400 }}>
                        {isExpiringSoon ? `${daysLeft} days left!` : new Date(coupon.expiry_date || coupon.valid_until).toLocaleDateString()}
                      </span>
                    </div>
                    {coupon.applicable_categories?.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                        <strong>Valid for:</strong>
                        <span>{coupon.applicable_categories.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--primary-green)',
                      color: 'var(--text-dark)',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
