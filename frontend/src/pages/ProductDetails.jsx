import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { productsAPI } from '../api/products';
import { addToCart, selectCartItems } from '../store/slices/cartSlice';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { fetchReviewSummary, selectReviewSummary } from '../store/slices/reviewsSlice';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import useActivityLog from '../hooks/useActivityLog';

const StarIcon = ({ filled }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? '#f59e0b' : 'none'}
    stroke="#f59e0b"
    strokeWidth="1.5"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reviewSummary = useSelector((state) => selectReviewSummary(state, parseInt(id, 10)));
  const cartItems = useSelector(selectCartItems);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const { logCustomActivity } = useActivityLog('page_view', { section: 'product_details' });
  
  // Check if product is already in cart
  const cartItem = product && cartItems.find(item => 
    item.id === product.id || item.product?.id === product.id
  );

  // Sync counter state with cart when product loads
  useEffect(() => {
    if (product && cartItem) {
      setShowCounter(true);
      setQuantity(cartItem.quantity || 1);
    }
  }, [product, cartItem]);
  
  // Memoize the log function to prevent infinite re-renders
  const logProductView = useCallback((productId, productName) => {
    logCustomActivity('product_view', { product_id: productId, product_name: productName });
  }, [logCustomActivity]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setProduct(null); // Reset product before fetching
        
        const [productRes, relatedRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getRelated(id),
        ]);
        
        // Validate product data exists
        if (!productRes.data || !productRes.data.id) {
          throw new Error('Product not found');
        }
        
        setProduct(productRes.data);
        const relatedData = relatedRes.data?.results || relatedRes.data;
        setRelatedProducts(Array.isArray(relatedData) ? relatedData.slice(0, 4) : []);

        // Log product view
        if (productRes.data.name) {
          logProductView(id, productRes.data.name);
        }

        // Fetch review summary to get actual reviews count
        dispatch(fetchReviewSummary(productRes.data.id));

        // Check if product is in wishlist
        if (isAuthenticated) {
          try {
            const wishlistRes = await wishlistAPI.getWishlist();
            const wishlistItems = wishlistRes.data.results || wishlistRes.data;
            if (Array.isArray(wishlistItems)) {
              const wishlistIds = wishlistItems.map(item => item.product?.id);
              setIsWishlisted(wishlistIds.includes(parseInt(id, 10)));
            }
          } catch (error) {
            console.error('Error fetching wishlist:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, isAuthenticated, logProductView, dispatch]);

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    const addQty = quantity > 0 ? quantity : 1;
    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product.id, quantity: addQty, product })).unwrap();
      toast.success(`Added ${addQty} ${product.name} to cart! 🛒`);
      logCustomActivity('add_to_cart', { product_id: product.id, product_name: product.name, quantity: addQty });
      setShowCounter(true);
      setQuantity(addQty);
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity <= 1) {
      setShowCounter(false);
      setQuantity(0);
    } else {
      setQuantity(quantity - 1);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist(product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
        logCustomActivity('remove_from_wishlist', { product_id: product.id, product_name: product.name });
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist 💖');
        logCustomActivity('add_to_wishlist', { product_id: product.id, product_name: product.name });
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - Happy Groceries`,
          text: `Check out ${product.name} on Happy Groceries!`,
          url: window.location.href,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard! 📋');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const getStockInfo = (stock) => {
    if (stock <= 0) return { label: 'Out of stock', className: 'out-of-stock', icon: '⛔' };
    if (stock <= 5) return { label: `Low stock (${stock} left)`, className: 'low-stock', icon: '⚡' };
    return { label: `In stock (${stock} available)`, className: 'in-stock', icon: '✅' };
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
    const fullStars = Math.round(rating || 0);
    return [1, 2, 3, 4, 5].map((i) => (
      <StarIcon key={i} filled={i <= fullStars} />
    ));
  };

  if (loading) return <PageLoader />;
  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Product not found</h2>
        <p>Redirecting to shop...</p>
      </div>
    );
  }

  const hasDiscount = product.discount_percent > 0;
  const priceValue = parseFloat(product.price) || 0;
  const discountPercent = parseFloat(product.discount_percent) || 0;
  const discountedPrice = hasDiscount
    ? priceValue * (1 - discountPercent / 100)
    : priceValue;
  const savings = hasDiscount ? priceValue - discountedPrice : 0;
  const stockInfo = getStockInfo(product.stock);

  return (
    <div className="container">
      <div className="product-details-header">
        <Link to="/shop" className="btn-secondary">← Back to Shop</Link>
        <div className="share-actions">
          <button className="btn-secondary" onClick={handleShare}>🔗 Share</button>
          <button className="btn-secondary" onClick={copyLink}>📋 Copy Link</button>
        </div>
      </div>

      <div className="product-details-wrapper">
        <div className="product-details-card">
          <div className="product-details-grid">
            <div className="product-image-section">
              <div
                className="product-details-image"
                onClick={() => setShowImageViewer(true)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label="View full size image"
              >
                {product.emoji}
              </div>
              {hasDiscount && (
                <div className="discount-badge">
                  <span className="discount-percentage">{product.discount_percent}% OFF</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="product-details-name">{product.name}</h1>

              <div className="product-details-meta">
                <span 
                  className="product-category" 
                  style={{ background: getCategoryColor(product.category?.name || product.category) }}
                >
                  {product.category?.name || product.category}
                </span>
                <span className={`stock-badge ${stockInfo.className}`}>
                  {stockInfo.icon} {stockInfo.label}
                </span>
              </div>

              <div className="product-rating" style={{ marginBottom: '0.25rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  {renderStars(product.rating)}
                </span>
                <span style={{ color: 'var(--text-dark)', marginLeft: '0.5rem' }}>
                  ({parseFloat(product.rating).toFixed(1)}) • {reviewSummary ? reviewSummary.total_reviews : product.reviews_count || 0} reviews
                </span>
              </div>

              <div className="product-details-price-section">
                {hasDiscount ? (
                  <>
                    <div className="price-with-discount">
                      <span className="original-price">₹{product.price}</span>
                      <span className="discounted-price">₹{discountedPrice.toFixed(0)}</span>
                    </div>
                    <div className="savings-amount">You save ₹{savings.toFixed(0)}!</div>
                  </>
                ) : (
                  <div className="product-details-price">₹{product.price}</div>
                )}
              </div>

              <div className="product-details-description">
                <h3 style={{ marginBottom: '0.5rem' }}>Details</h3>
                <p>{product.description || 'Fresh, high-quality groceries delivered with love. 💖'}</p>
              </div>

              <div className="product-details-actions">
                {showCounter ? (
                  <>
                    <div className="quantity-controls" aria-label="Quantity selector">
                      <button 
                        className="qty-btn" 
                        onClick={handleDecreaseQty}
                        disabled={product.stock <= 0}
                      >−</button>
                      <input 
                        type="number" 
                        className="qty-input" 
                        value={quantity} 
                        min="1" 
                        max={Math.min(99, product.stock)} 
                        onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), Math.min(99, product.stock)))}
                        disabled={product.stock <= 0}
                      />
                      <button 
                        className="qty-btn" 
                        onClick={() => setQuantity(Math.min(Math.min(99, product.stock), quantity + 1))}
                        disabled={product.stock <= 0}
                      >+</button>
                    </div>

                    <Link 
                      to="/cart" 
                      className="btn-primary"
                      style={{ minWidth: '200px', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      View Cart 🛒
                    </Link>
                  </>
                ) : (
                  <button 
                    className="btn-add-cart" 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || isAddingToCart}
                    style={{ minWidth: '200px' }}
                  >
                    {product.stock <= 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                )}

                <button 
                  className={`product-details-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                  aria-label="Toggle wishlist"
                >
                  {isWishlisted ? '💖' : '🤍'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="product-tabs" style={{ marginTop: '2rem' }}>
        <div className="tab-buttons" style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--primary-pink)', marginBottom: '1.5rem' }}>
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'details' ? '3px solid var(--primary-pink)' : 'none',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'details' ? 'var(--primary-pink)' : 'var(--text-dark)'
            }}
          >
            Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '3px solid var(--primary-pink)' : 'none',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'reviews' ? 'var(--primary-pink)' : 'var(--text-dark)'
            }}
          >
            Reviews ({reviewSummary ? reviewSummary.total_reviews : product.reviews_count || 0})
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="tab-content">
            <div className="product-specs" style={{ background: 'var(--bg-white)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
              <h3>Product Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <strong>Category:</strong> {product.category?.name || product.category}
                </div>
                <div>
                  <strong>Stock:</strong> {product.stock} units
                </div>
                <div>
                  <strong>Rating:</strong> {product.rating}/5
                </div>
                {hasDiscount && (
                  <div>
                    <strong>Discount:</strong> {product.discount_percent}% off
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-content">
            <ProductReviews productId={product.id} />
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 className="section-title">🧡 Related Products</h2>
          <div className="products-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div
          className="image-viewer-modal show"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            className="image-viewer-close"
            onClick={() => setShowImageViewer(false)}
            aria-label="Close image viewer"
          >
            ✕
          </button>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            {product.emoji}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
