import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../api/wishlist';
import { PageLoader } from '../components/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useActivityLog('page_view', { section: 'wishlist' });

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems((prev) => prev.filter(item => item.product.id !== productId));
      toast.success('Removed from wishlist 💔');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.round(rating || 0);
    return (
      <span>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={i <= fullStars ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            strokeWidth="1.5"

          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </span>
    );
  };

  if (loading) return <PageLoader />;

  if (wishlistItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">💔</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love and they&apos;ll appear here</p>
          <Link to="/shop" className="btn-primary wishlist-explore-btn">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="wishlist-container">
        <h2 className="section-title">💝 My Wishlist</h2>

        <p>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>

        <div className="products-grid">
          {wishlistItems.map((item) => {
            const product = item.product;
            const isOnSale = product.effective_price && parseFloat(product.effective_price) < parseFloat(product.price);
            const displayPrice = isOnSale ? product.effective_price : product.price;
            const variantName = product.default_variant?.variant_name || '';

            return (
              <div key={product.id} className="product-card">
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="wishlist-btn active"
                  type="button"
                  aria-label="Remove from wishlist"
                >
                  ❤️
                </button>

                {isOnSale && <span className="sale-badge">Sale</span>}

                <Link
                  to={`/product/${product.id}`}
                  className="product-card-link"
                >
                  <div className="product-image">{product.emoji || '📦'}</div>
                  <h3 className="product-name">{product.name}</h3>
                  {variantName && (
                    <p className="wishlist-product-meta">
                      {variantName}
                    </p>
                  )}
                  <span
                    className="product-category"
                  >
                    {product.category?.name || product.category}
                  </span>
                  <div className="product-rating">{renderStars(product.rating)}</div>
                  <div className="product-price-wrapper">
                    {isOnSale ? (
                      <>
                        <p className="product-price">
                          {formatPrice(displayPrice)}
                          <span className="discount-badge">
                            -{Math.round((1 - parseFloat(displayPrice) / parseFloat(product.price)) * 100)}%
                          </span>
                        </p>
                        <p className="product-price-original">{formatPrice(product.price)}</p>
                      </>
                    ) : (
                      <p className="product-price">{formatPrice(product.price)}</p>
                    )}
                  </div>
                  <p className="product-card-cta">View Details →</p>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="wishlist-footer-link">
          <Link to="/shop" className="btn-primary wishlist-continue-btn">
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
