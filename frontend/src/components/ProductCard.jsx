import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartItem, selectCartItems } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showAddToCart = true }) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  // Find if product is in cart (handles both authenticated and guest carts)
  const cartItem = cartItems.find(item => 
    item.product?.id === product.id || item.id === product.id
  );
  const inCart = !!cartItem;

  // Use cart item quantity if available, otherwise use local quantity
  const displayQuantity = cartItem ? cartItem.quantity : quantity;

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥕',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity, product })).unwrap();
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

  const incrementQuantity = async () => {
    const newQuantity = quantity + 1;
    if (newQuantity > 99) {
      toast.error('Maximum quantity reached!');
      return;
    }
    
    if (inCart && cartItem) {
      // Update cart directly if item is already in cart
      // Use item.id directly for guest carts (which equals product.id)
      const itemId = cartItem.product?.id || cartItem.id;
      try {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
        setQuantity(newQuantity);
      } catch {
        toast.error('Failed to update quantity');
      }
    } else {
      setQuantity(newQuantity);
    }
  };

  const decrementQuantity = async () => {
    if (quantity <= 1) return;
    
    const newQuantity = quantity - 1;
    
    if (inCart && cartItem) {
      // Update cart directly if item is already in cart
      // Use item.id directly for guest carts (which equals product.id)
      const itemId = cartItem.product?.id || cartItem.id;
      try {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
        setQuantity(newQuantity);
      } catch {
        toast.error('Failed to update quantity');
      }
    } else {
      setQuantity(newQuantity);
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
    <div className={`product-card ${isOnSale ? 'on-sale' : ''}`}>
      {isOnSale && <span className="sale-badge">Sale</span>}
      
      <button
        onClick={handleWishlist}
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        style={{ color: isWishlisted ? '#ff4444' : 'inherit' }}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>

      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image">
          {product.emoji || categoryEmojis[product.category?.toLowerCase?.()] || '📦'}
        </div>
      </Link>

      <span className="product-category">
        {typeof product.category === 'object' ? product.category?.name : product.category}
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

      <Link to={`/product/${product.id}`} className="product-card-cta" style={{ display: 'block', marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary-pink)', textDecoration: 'none' }}>
        View Details →
      </Link>

      {showAddToCart && product.stock > 0 && (
        <div className="product-actions">
          {inCart ? (
            // Show quantity controls if product is already in cart
            <div className="quantity-controls">
              <button className="qty-btn" onClick={decrementQuantity} disabled={displayQuantity <= 1}>
                −
              </button>
              <input 
                type="text" 
                className="qty-input" 
                value={displayQuantity} 
                readOnly 
              />
              <button className="qty-btn" onClick={incrementQuantity}>
                +
              </button>
            </div>
          ) : (
            // Show add to cart button if product is not in cart
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
