import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartItem, removeFromCart, selectCartItems } from '../store/slices/cartSlice';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showAddToCart = true }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const cartItem = cartItems.find(item =>
    item.product?.id === product.id || item.id === product.id
  );
  const inCart = !!cartItem;
  const displayQuantity = cartItem ? cartItem.quantity : 0;

  const categoryEmojis = {
    'fruits': '🍎',
    'vegetables': '🥕',
    'dairy': '🥛',
    'snacks': '🍪',
    'beverages': '🧃',
    'bakery': '🥖',
    'meat': '🥩',
    'seafood': '🐟',
    'grains': '🌾',
    'spices': '🌶️',
    'oils': '🫒',
    'nuts': '🥜',
    'frozen': '🧊',
    'organic': '🌱',
    'condiments': '🧂',
    'cereals': '🥣',
    'pasta': '🍝',
    'rice': '🍚',
    'bread': '🍞',
    'eggs': '🥚',
  };

  const getProductEmoji = (product) => {
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    if (name.includes('apple') || name.includes('mango') || name.includes('banana') || name.includes('orange') || name.includes('grapes')) {
      if (name.includes('apple')) return '🍎';
      if (name.includes('mango')) return '🥭';
      if (name.includes('banana')) return '🍌';
      if (name.includes('orange')) return '🍊';
      if (name.includes('grapes')) return '🍇';
      if (name.includes('strawberry')) return '🍓';
      if (name.includes('watermelon')) return '🍉';
      if (name.includes('pineapple')) return '🍍';
      return '🍎';
    }
    
    if (name.includes('tomato') || name.includes('potato') || name.includes('onion') || name.includes('carrot') || name.includes('lettuce')) {
      if (name.includes('tomato')) return '🍅';
      if (name.includes('potato')) return '🥔';
      if (name.includes('onion')) return '🧅';
      if (name.includes('carrot')) return '🥕';
      if (name.includes('lettuce') || name.includes('cabbage')) return '🥬';
      if (name.includes('cucumber')) return '🥒';
      if (name.includes('pepper') || name.includes('chili')) return '🌶️';
      return '🥕';
    }
    
    if (name.includes('bread') || name.includes('toast')) return '🍞';
    if (name.includes('milk')) return '🥛';
    if (name.includes('cheese')) return '🧀';
    if (name.includes('butter')) return '🧈';
    if (name.includes('yogurt') || name.includes('curd')) return '🥛';
    if (name.includes('biscuit') || name.includes('cookie')) return '🍪';
    if (name.includes('chips')) return '🥔';
    if (name.includes('chocolate')) return '🍫';
    if (name.includes('rice')) return '🍚';
    if (name.includes('pasta') || name.includes('noodles')) return '🍝';
    if (name.includes('oil')) return '🫒';
    if (name.includes('egg')) return '🥚';
    if (name.includes('chicken')) return '🍗';
    if (name.includes('fish')) return '🐟';
    if (name.includes('sugar')) return '🧂';
    if (name.includes('salt')) return '🧂';
    if (name.includes('coffee')) return '☕';
    if (name.includes('tea')) return '🍵';
    if (name.includes('juice')) return '🧃';
    if (name.includes('water')) return '💧';
    if (name.includes('ice cream')) return '🍦';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    
    return categoryEmojis[category] || '📦';
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

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1, product })).unwrap();
      toast.success(`Added ${product.name} to cart! 🛒`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = async () => {
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

  const handleIncrement = async () => {
    if (!inCart || !cartItem) return;
    const newQuantity = displayQuantity + 1;
    if (newQuantity > 99) {
      toast.error('Maximum quantity reached!');
      return;
    }
    const itemId = cartItem.product?.id || cartItem.id;
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleDecrement = async () => {
    if (!inCart || !cartItem) return;
    const newQuantity = displayQuantity - 1;
    const itemId = cartItem.product?.id || cartItem.id;
    if (newQuantity <= 0) {
      try {
        await dispatch(removeFromCart(itemId)).unwrap();
        toast.success(`${product.name} removed from cart`);
      } catch {
        toast.error('Failed to remove from cart');
      }
    } else {
      try {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      } catch {
        toast.error('Failed to update quantity');
      }
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

      {isAuthenticated && (
        <button
          onClick={handleWishlist}
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          style={{ color: isWishlisted ? '#ff4444' : 'inherit' }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      )}

      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image">
          {product.emoji || getProductEmoji(product)}
        </div>
      </Link>

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
            <div className="quantity-controls">
              <button className="qty-btn" onClick={handleDecrement}>
                −
              </button>
              <input
                type="text"
                className="qty-input"
                value={displayQuantity}
                readOnly
              />
              <button className="qty-btn" onClick={handleIncrement}>
                +
              </button>
            </div>
          ) : (
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          )}
        </div>
      )}

      <Link to={`/product/${product.id}`} className="product-card-cta" style={{ display: 'block', marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary-pink)', textDecoration: 'none' }}>
        View Details →
      </Link>
    </div>
  );
};

export default ProductCard;