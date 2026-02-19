import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartItem, removeFromCart, selectCartItems } from '../store/slices/cartSlice';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showAddToCart = true }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const cartItem = cartItems.find(item =>
    (item.product?.id === product.id) || (!item.product && item.id === product.id)
  );
  const inCart = !!cartItem;
  const displayQuantity = cartItem ? cartItem.quantity : 0;

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥕',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const response = await wishlistAPI.checkWishlist(product.id);
        setIsWishlisted(response.data.is_in_wishlist);
      } catch {
        setIsWishlisted(false);
      }
    };

    if (isAuthenticated) {
      fetchWishlistStatus();
    } else {
      setIsWishlisted(false);
    }
  }, [isAuthenticated, product.id]);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('.quantity-controls')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1, product })).unwrap();
      toast.success(`Added ${product.name} to cart! 🛒`);
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    try {
      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist(product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist 💔');
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist ❤️');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const getCartItemId = () => {
    if (!cartItem) return null;
    return cartItem.id;
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    if (!inCart || !cartItem || isUpdatingQuantity) return;
    const newQuantity = displayQuantity + 1;
    if (newQuantity > 99) {
      toast.error('Maximum quantity reached!');
      return;
    }
    const itemId = getCartItemId();
    setIsUpdatingQuantity(true);
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update quantity');
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const handleDecrement = async (e) => {
    e.stopPropagation();
    if (!inCart || !cartItem || isUpdatingQuantity) return;
    const newQuantity = displayQuantity - 1;
    const itemId = getCartItemId();
    setIsUpdatingQuantity(true);
    try {
      if (newQuantity <= 0) {
        await dispatch(removeFromCart(itemId)).unwrap();
        toast.success(`${product.name} removed from cart`);
      } else {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      }
    } catch (err) {
      toast.error(err || 'Failed to update quantity');
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

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
    <div 
      className={`product-card ${isOnSale ? 'on-sale' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {isOnSale && <span className="sale-badge">Sale</span>}

      {isAuthenticated && (
        <button
          onClick={handleWishlist}
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          style={{ color: isWishlisted ? '#ff4444' : 'inherit' }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      )}

      <div className="product-image">
        {product.emoji || categoryEmojis[product.category?.toLowerCase?.()] || '📦'}
      </div>

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
                -{Math.round((1 - parseFloat(displayPrice) / parseFloat(product.price)) * 100)}%
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
          {inCart ? (
            <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
              <button 
                className="qty-btn" 
                onClick={handleDecrement}
                disabled={isUpdatingQuantity}
              >
                −
              </button>
              <input
                type="text"
                className="qty-input"
                value={displayQuantity}
                readOnly
              />
              <button 
                className="qty-btn" 
                onClick={handleIncrement}
                disabled={isUpdatingQuantity}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      )}

      <Link 
        to={`/product/${product.id}`} 
        className="product-card-cta" 
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'block', marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary-pink)', textDecoration: 'none' }}
      >
        View Details →
      </Link>
    </div>
  );
};

export default ProductCard;
