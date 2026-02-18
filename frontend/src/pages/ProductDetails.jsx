import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { productsAPI } from '../api/products';
import { addToCart } from '../store/slices/cartSlice';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [productRes, relatedRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getRelated(id),
        ]);
        setProduct(productRes.data);
        setRelatedProducts(relatedRes.data.slice(0, 4));
        
        // Check if product is in wishlist
        if (isAuthenticated) {
          try {
            const wishlistRes = await wishlistAPI.getWishlist();
            const wishlistIds = wishlistRes.data.map(item => item.product.id);
            setIsWishlisted(wishlistIds.includes(parseInt(id)));
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
  }, [id, navigate, isAuthenticated]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      toast.success(`Added ${quantity} ${product.name} to cart! 🛒`);
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add to cart');
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
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist 💖');
      }
    } catch (error) {
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
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;
  const savings = hasDiscount ? product.price - discountedPrice : 0;
  const stockInfo = getStockInfo(product.stock);

  // Mock reviews for display
  const reviews = [
    { name: 'Aarav', rating: 5, text: `Super fresh ${product.name}! Will buy again.`, date: '2 days ago' },
    { name: 'Meera', rating: 4, text: 'Great quality and fast delivery. Very happy with the purchase.', date: '1 week ago' },
    { name: 'Priya', rating: 5, text: 'Best quality I have found. Highly recommended!', date: '2 weeks ago' },
  ];

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
              <div className="product-details-image">{product.emoji}</div>
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
                {renderStars(product.rating)}
                <span style={{ color: 'var(--text-dark)', marginLeft: '0.5rem' }}>
                  ({product.rating}) • {product.reviews_count || 0} reviews
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
                <div className="quantity-controls" aria-label="Quantity selector">
                  <button 
                    className="qty-btn" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
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

                <button 
                  className="btn-add-cart" 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  style={{ minWidth: '200px' }}
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

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
            Reviews ({product.reviews_count || 0})
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
            <div className="reviews-grid" style={{ display: 'grid', gap: '1rem' }}>
              {reviews.map((review, index) => (
                <div key={index} className="review-card" style={{ background: 'var(--bg-white)', padding: '1.25rem', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4>{review.name}</h4>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>{review.date}</span>
                  </div>
                  <div style={{ color: '#ffc107', marginBottom: '0.5rem' }}>
                    {'⭐'.repeat(review.rating)}
                  </div>
                  <p>{review.text}</p>
                </div>
              ))}
            </div>
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
    </div>
  );
};

export default ProductDetails;
