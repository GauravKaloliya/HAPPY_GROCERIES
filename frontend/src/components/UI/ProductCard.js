import React from 'react';
import { Link } from 'react-router-dom';

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '⭐';
  }
  if (hasHalfStar) {
    stars += '⭐';
  }
  
  return stars;
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'Fruits':
      return 'var(--primary-pink)';
    case 'Vegetables':
      return 'var(--primary-green)';
    case 'Dairy':
      return 'var(--primary-blue)';
    case 'Snacks':
      return 'var(--primary-yellow)';
    case 'Beverages':
      return 'var(--primary-orange)';
    default:
      return 'var(--primary-blue)';
  }
};

const ProductCard = ({ product, isWishlisted, onWishlistToggle }) => {
  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = product.discounted_price;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  return (
    <div className={`product-card ${hasDiscount ? 'on-sale' : ''}`}>
      <button 
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={handleWishlistClick}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? '💖' : '🤍'}
      </button>
      
      <Link to={`/products/${product.id}`} className="product-card-link">
        {hasDiscount && <span className="sale-badge">SALE</span>}
        
        <div className="product-image">{product.emoji}</div>
        
        <h3 className="product-name">{product.name}</h3>
        
        <span 
          className="product-category" 
          style={{ background: getCategoryColor(product.category.name) }}
        >
          {product.category.name}
        </span>
        
        <div className="product-rating">
          {renderStars(product.rating)} ({product.rating})
        </div>
        
        {hasDiscount ? (
          <div className="product-price-wrapper">
            <p className="product-price-original">₹{product.price}</p>
            <p className="product-price">
              ₹{parseFloat(discountedPrice).toFixed(0)}
              <span className="discount-badge">{product.discount_percent}% OFF</span>
            </p>
          </div>
        ) : (
          <p className="product-price">₹{product.price}</p>
        )}
        
        <p className="product-card-cta">View Details →</p>
      </Link>
    </div>
  );
};

export default ProductCard;
