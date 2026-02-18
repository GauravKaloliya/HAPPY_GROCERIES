import React, { useState, useEffect } from 'react';
import { couponsAPI } from '../services/api';
import { showToast } from '../components/UI/Toast';

const Offers = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await couponsAPI.getAll();
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied ${code} to clipboard!`);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'percentage': return { text: '% OFF', color: 'var(--primary-pink)' };
      case 'fixed': return { text: '₹ OFF', color: 'var(--primary-green)' };
      case 'category': return { text: 'CATEGORY', color: 'var(--primary-blue)' };
      default: return { text: 'OFFER', color: 'var(--primary-yellow)' };
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">🎁 Available Offers</h1>

      <div className="offers-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {coupons.map(coupon => {
          const badge = getTypeBadge(coupon.type);
          return (
            <div 
              key={coupon.id} 
              className="offer-card applicable"
              style={{ cursor: 'pointer' }}
              onClick={() => copyToClipboard(coupon.code)}
            >
              <div className="offer-header">
                <span 
                  className="offer-badge applicable"
                  style={{ background: badge.color }}
                >
                  {badge.text}
                </span>
                {coupon.first_order_only && (
                  <span className="expiry-badge">First Order Only</span>
                )}
              </div>
              
              <div className="offer-content">
                <h4 style={{ fontSize: '1.8rem', color: badge.color }}>{coupon.code}</h4>
                <p className="offer-description">{coupon.description}</p>
                
                {coupon.applicable_categories?.length > 0 && (
                  <p className="offer-categories">
                    Valid for: {coupon.applicable_categories.join(', ')}
                  </p>
                )}
                
                <div className="offer-savings">
                  <span 
                    className="savings-amount"
                    style={{ background: badge.color }}
                  >
                    {coupon.type === 'fixed' ? `₹${coupon.value} OFF` : `${coupon.value}% OFF`}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  Min. order: ₹{coupon.min_order_value}
                  {coupon.max_discount && ` • Max discount: ₹${coupon.max_discount}`}
                </p>
                
                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                  Valid until: {new Date(coupon.expiry_date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="offer-actions">
                <button className="btn-apply-offer" style={{ background: badge.color }}>
                  Click to Copy Code
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Offers;
