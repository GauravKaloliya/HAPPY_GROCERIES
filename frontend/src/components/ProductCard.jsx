import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCartItem, removeFromCart, selectCartItems } from '../store/slices/cartSlice';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const WISHLIST_CACHE_KEY = 'wishlistProductIds';
const wishlistStatusCache = new Map();

const getWishlistCache = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setWishlistCache = (ids) => {
  localStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify(ids));
};

const updateWishlistCache = (productId, shouldInclude) => {
  const current = getWishlistCache();
  const next = shouldInclude
    ? Array.from(new Set([...current, productId]))
    : current.filter((id) => id !== productId);
  setWishlistCache(next);
};

const ProductCard = ({ product, showAddToCart = true }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const cartItem = cartItems.find(item =>
    (item.product?.id ?? item.id) === product.id
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
    if (!isAuthenticated) {
      setIsWishlisted(false);
      return;
    }

    const cachedLocal = getWishlistCache().includes(product.id);
    const cachedStatus = wishlistStatusCache.get(product.id);
    setIsWishlisted(typeof cachedStatus === 'boolean' ? cachedStatus : cachedLocal);

    if (typeof cachedStatus === 'boolean') {
      return;
    }

    let cancelled = false;
    const fetchWishlistStatus = async () => {
      try {
        const response = await wishlistAPI.checkWishlist(product.id);
        if (!cancelled) {
          const isInWishlist = !!response.data.is_in_wishlist;
          setIsWishlisted(isInWishlist);
          updateWishlistCache(product.id, isInWishlist);
          wishlistStatusCache.set(product.id, isInWishlist);
        }
      } catch {
        // Keep cached state if request fails.
      }
    };

    fetchWishlistStatus();
    return () => { cancelled = true; };
  }, [isAuthenticated, product.id]);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.quantity-controls') || e.target.closest('a')) {
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
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist 🔒');
      navigate('/login');
      return;
    }

    if (isWishlistLoading) return;
    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist(product.id);
        setIsWishlisted(false);
        updateWishlistCache(product.id, false);
        wishlistStatusCache.set(product.id, false);
        toast.success('Removed from wishlist 💔');
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setIsWishlisted(true);
        updateWishlistCache(product.id, true);
        wishlistStatusCache.set(product.id, true);
        toast.success('Added to wishlist ❤️');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    if (!inCart || !cartItem || isUpdatingQuantity) return;
    const newQuantity = displayQuantity + 1;
    if (newQuantity > 99) {
      toast.error('Maximum quantity reached!');
      return;
    }
    const itemId = isAuthenticated ? cartItem.id : (cartItem.product?.id || cartItem.id);
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
    const itemId = isAuthenticated ? cartItem.id : (cartItem.product?.id || cartItem.id);
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
  const categoryName = product.category?.name || product.category || '';
  const brandName = product.brand?.name || product.brand_name || '';
  const defaultVariantLabel = product.default_variant?.variant_name || '';

  const renderStars = (rating) => {
    const fullStars = Math.round(rating || 0);
    return (
      <span className="product-stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={i <= fullStars ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            strokeWidth="1.5"
            className="product-star-icon"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </span>
    );
  };

  return (
    <div
      className={`product-card ${isOnSale ? 'on-sale' : ''}`}
      onClick={handleCardClick}
    >
      {isOnSale && <span className="sale-badge">Sale</span>}

      <button
        onClick={handleWishlist}
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        disabled={isWishlistLoading}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>

      <div className="product-image">
        {product.emoji || categoryEmojis[categoryName?.toLowerCase?.()] || '📦'}
      </div>

      <h3 className="product-name">{product.name}</h3>
      {(brandName || defaultVariantLabel) && (
        <div className="product-meta-line">
          {brandName && <span className="product-brand-badge">{brandName}</span>}
          {defaultVariantLabel && <span className="product-variant-badge">{defaultVariantLabel}</span>}
        </div>
      )}

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
            <>
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
              <div className="product-view-cart-row">
                <Link
                  to="/cart"
                  className="btn-sm btn-primary view-cart-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Cart
                </Link>
              </div>
            </>
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
      >
        View Details →
      </Link>
    </div>
  );
};

export default ProductCard;
