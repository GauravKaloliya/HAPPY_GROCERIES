import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItems } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showAddToCart = true }) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥕',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      toast.success(`Added ${product.name} to cart! 🛒`);
      setQuantity(1);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist 💔' : 'Added to wishlist ❤️');
  };

  const incrementQuantity = () => {
    if (quantity < 99) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const inCart = cartItems.find(item => item.product?.id === product.id);

  const isOnSale = product.effective_price && parseFloat(product.effective_price) < parseFloat(product.price);
  const displayPrice = isOnSale ? product.effective_price : product.price;
  
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆');
    }
    return stars.join('');
  };

  return (
    <div className={`product-card ${isOnSale ? 'on-sale' : ''}`}>
      {isOnSale && <span className="sale-badge">Sale</span>}
      
      <button
        onClick={handleWishlist}
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        style={{ color: isWishlisted ? '#ff4444' : 'inherit' }}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>

      <Link to={`/shop?product=${product.id}`} className="product-card-link">
        <div className="product-image">
          {product.emoji || categoryEmojis[product.category] || '📦'}
        </div>
      </Link>

      <span className="product-category">
        {product.category}
      </span>

      <h3 className="product-name">{product.name}</h3>

      <div className="product-rating">
        {renderStars(product.rating)}
      </div>

      <div className="product-price-wrapper">
        {isOnSale ? (
          <>
            <span className="product-price">
              {formatPrice(displayPrice)}
              <span className="discount-badge">
                -{Math.round((1 - displayPrice / product.price) * 100)}%
              </span>
            </span>
            <span className="product-price-original">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="product-price">{formatPrice(product.price)}</span>
        )}
      </div>

      {showAddToCart && product.stock > 0 && (
        <div className="product-actions">
          <div className="quantity-controls">
            <button className="qty-btn" onClick={decrementQuantity} disabled={quantity <= 1}>
              −
            </button>
            <input 
              type="text" 
              className="qty-input" 
              value={quantity} 
              readOnly 
            />
            <button className="qty-btn" onClick={incrementQuantity}>
              +
            </button>
          </div>
          <button 
            className="btn-add-cart"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      )}

      {inCart && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--primary-green)', fontWeight: 600 }}>
          ✓ {inCart.quantity} in cart
        </div>
      )}
    </div>
  );
};

export default ProductCard;
