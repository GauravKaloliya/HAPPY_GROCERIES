import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useActivityLog('page_view', { section: 'wishlist' });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await wishlistAPI.getWishlist();
        setWishlistItems(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item.product.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Fruits': 'var(--primary-pink)',
      'Vegetables': 'var(--primary-green)',
      'Dairy': 'var(--primary-blue)',
      'Snacks': 'var(--primary-yellow)',
      'Beverages': 'var(--primary-orange)',
    };
    return colors[category] || 'var(--primary-blue)';
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
  };

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="login-required" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
          <h2>Please login to view your wishlist</h2>
          <p>You need to be logged in to save your favorite items</p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: '1rem' }}>
            Login
          </button>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">💝</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love and they'll appear here</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2 className="section-title">💝 My Wishlist</h2>
      
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
      </p>

      <div className="products-grid">
        {wishlistItems.map((item) => {
          const product = item.product;
          const effectivePrice = product.effective_price ? Number(product.effective_price) : product.price * (1 - product.discount_percent / 100);
          const hasDiscount = effectivePrice < product.price;

          return (
            <div key={product.id} className="product-card">
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="wishlist-btn active"
                style={{ color: '#ff4444' }}
              >
                ❤️
              </button>

              <Link to={`/product/${product.id}`} className="product-card-link">
                {hasDiscount && <span className="sale-badge">SALE</span>}
                <div className="product-image">{product.emoji}</div>
                <h3 className="product-name">{product.name}</h3>
                <span 
                  className="product-category" 
                  style={{ background: getCategoryColor(product.category?.name || product.category) }}
                >
                  {product.category?.name || product.category}
                </span>
                <div className="product-rating">{renderStars(product.rating)}</div>
                <div className="product-price-wrapper">
                  {hasDiscount ? (
                    <>
                      <p className="product-price">
                        ₹{effectivePrice.toFixed(0)}
                        <span className="discount-badge">{product.discount_percent}% OFF</span>
                      </p>
                      <p className="product-price-original">₹{product.price}</p>
                    </>
                  ) : (
                    <p className="product-price">₹{product.price}</p>
                  )}
                </div>
                <p className="product-card-cta">View Details →</p>
              </Link>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/shop" style={{ color: 'var(--primary-pink)', textDecoration: 'none', fontWeight: 600 }}>
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
