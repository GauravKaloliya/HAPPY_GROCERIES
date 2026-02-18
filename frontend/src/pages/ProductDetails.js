import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/UI/Toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
      
      // Fetch related products from same category
      const relatedResponse = await productsAPI.getByCategory(response.data.category.id);
      setRelatedProducts(relatedResponse.data.filter(p => p.id !== parseInt(id)).slice(0, 4));
      
      // Check wishlist status
      if (isAuthenticated) {
        const wishlistResponse = await wishlistAPI.check(id);
        setIsWishlisted(wishlistResponse.data.is_wishlisted);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      showToast('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await cartAPI.addItem(product.id, quantity);
      showToast('Added to cart 🛒');
      setQuantity(1);
    } catch (error) {
      showToast('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please login to use wishlist');
      return;
    }

    try {
      const response = await wishlistAPI.toggle(product.id);
      setIsWishlisted(response.data.action === 'added');
      showToast(response.data.action === 'added' ? 'Added to wishlist 💖' : 'Removed from wishlist');
    } catch (error) {
      showToast('Failed to update wishlist');
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">😢</div>
          <h3>Product not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-details" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '3rem',
        margin: '2rem 0',
        alignItems: 'start'
      }}>
        {/* Product Image */}
        <div className="product-image-large" style={{
          background: 'var(--bg-white)',
          borderRadius: 'var(--border-radius)',
          padding: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8rem',
          minHeight: '400px',
          boxShadow: 'var(--shadow)'
        }}>
          {product.emoji}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
            <button 
              onClick={handleWishlistToggle}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer'
              }}
            >
              {isWishlisted ? '💖' : '🤍'}
            </button>
          </div>

          <div className="product-rating" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            {renderStars(product.rating)} ({product.rating}) • {product.reviews_count} reviews
          </div>

          <span 
            className="product-category" 
            style={{ 
              background: product.category.color,
              padding: '0.5rem 1rem',
              fontSize: '1rem'
            }}
          >
            {product.category.name}
          </span>

          <div style={{ margin: '1.5rem 0' }}>
            {product.has_discount ? (
              <div>
                <p style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#999' }}>
                  ₹{product.price}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-pink)' }}>
                  ₹{parseFloat(product.discounted_price).toFixed(0)}
                  <span className="discount-badge" style={{ marginLeft: '1rem' }}>
                    {product.discount_percent}% OFF
                  </span>
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-pink)' }}>
                ₹{product.price}
              </p>
            )}
          </div>

          <p style={{ 
            color: product.stock > 0 ? 'var(--primary-green)' : '#ff4444',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
          </p>

          <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{product.description}</p>

          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input 
                  type="number" 
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={product.stock}
                />
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
              <button 
                className="btn-primary"
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                Add to Cart 🛒
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Related Products</h2>
          <div className="products-grid">
            {relatedProducts.map(p => (
              <div 
                key={p.id} 
                className="product-card"
                onClick={() => navigate(`/products/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">{p.emoji}</div>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-price">₹{p.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
