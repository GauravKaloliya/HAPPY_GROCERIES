import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { productsAPI } from '../api/products';
import { addToCart, selectCartItems } from '../store/slices/cartSlice';
import { wishlistAPI } from '../api/wishlist';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { fetchReviewSummary, selectReviewSummary } from '../store/slices/reviewsSlice';
import { formatPrice } from '../utils/helpers';
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
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const { logCustomActivity } = useActivityLog('page_view', { section: 'product_details' });

  const logProductView = useCallback((productId, productName) => {
    logCustomActivity('product_view', { product_id: productId, product_name: productName });
  }, [logCustomActivity]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setProduct(null);

        const [productRes, relatedRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getRelated(id),
        ]);

        if (!productRes.data || !productRes.data.id) {
          throw new Error('Product not found');
        }

        setProduct(productRes.data);
        const variants = Array.isArray(productRes.data.variants) ? productRes.data.variants : [];
        const defaultVariant = productRes.data.default_variant || variants.find((variant) => variant.is_default) || variants[0];
        setSelectedVariantId(defaultVariant?.id || null);
        const relatedData = relatedRes.data?.results || relatedRes.data;
        setRelatedProducts(Array.isArray(relatedData) ? relatedData.slice(0, 4) : []);

        if (productRes.data.name) {
          logProductView(id, productRes.data.name);
        }

        dispatch(fetchReviewSummary(productRes.data.id));

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
      await dispatch(addToCart({
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        quantity: addQty,
        product,
        variant: selectedVariant,
      })).unwrap();
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

  const renderStars = (rating) => {
    const fullStars = Math.round(rating || 0);
    return [1, 2, 3, 4, 5].map((i) => (
      <StarIcon key={i} filled={i <= fullStars} />
    ));
  };

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : (product?.default_variant ? [product.default_variant] : []);
  const sortedVariants = [...variants].sort((a, b) => {
    const normalizeUnit = (variant) => {
      const unitType = (variant.unit_type || '').toLowerCase();
      const rawValue = Number(variant.unit_value ?? 0);
      if (unitType === 'kg') return rawValue * 1000;
      if (unitType === 'liter') return rawValue * 1000;
      if (unitType === 'l') return rawValue * 1000;
      if (unitType === 'g') return rawValue;
      if (unitType === 'ml') return rawValue;
      return rawValue;
    };
    const aUnit = normalizeUnit(a);
    const bUnit = normalizeUnit(b);
    if (aUnit !== bUnit) return aUnit - bUnit;
    const aPrice = Number(a.price ?? 0);
    const bPrice = Number(b.price ?? 0);
    return aPrice - bPrice;
  });
  const selectedVariant = sortedVariants.find((variant) => variant.id === selectedVariantId)
    || product?.default_variant
    || sortedVariants[0]
    || null;
  const cartItem = product && cartItems.find(item => {
    const itemProductId = item.product?.id ?? item.product_id ?? item.id;
    const itemVariantId = item.variant?.id ?? item.variant_id ?? null;
    const currentVariantId = selectedVariant?.id ?? null;
    return itemProductId === product.id && itemVariantId === currentVariantId;
  });
  useEffect(() => {
    if (product && cartItem) {
      setShowCounter(true);
      setQuantity(cartItem.quantity || 1);
    }
  }, [product, cartItem]);
  const selectedVariantStock = selectedVariant?.stock_quantity ?? product?.stock ?? 0;
  const selectedVariantPrice = selectedVariant?.price ?? product?.price ?? 0;
  const discountPercent = Number(product?.discount_percent) || 0;
  const hasDiscount = discountPercent > 0;
  const priceValue = Number(selectedVariantPrice) || 0;
  const discountedPrice = hasDiscount
    ? priceValue * (1 - discountPercent / 100)
    : priceValue;
  const savings = hasDiscount ? priceValue - discountedPrice : 0;
  const ratingValue = Number(product?.rating) || 0;
  const reviewsCount = Number(reviewSummary?.total_reviews ?? product?.reviews_count ?? 0);
  const stockInfo = getStockInfo(selectedVariantStock);

  if (loading) return <PageLoader />;
  if (!product) {
    return (
      <div className="container">
        <h2>Product not found</h2>
        <p>Redirecting to shop...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-details-header">
        <Link to="/shop" className="btn-md btn-secondary">← Back to Shop</Link>
        <div className="share-actions">
          <button className="btn-md btn-secondary" onClick={handleShare}>🔗 Share</button>
          <button className="btn-md btn-secondary" onClick={copyLink}>📋 Copy Link</button>
        </div>
      </div>

      <div className="product-details-wrapper">
        <div className="product-details-card">
          <div className="product-details-grid">
            <div className="product-image-section">
              <div
                className="product-details-image"
                onClick={() => setShowImageViewer(true)}
                role="button"
                aria-label="View full size image"
              >
                {product.emoji || product.category?.emoji || '📦'}
              </div>
              {hasDiscount && (
                <div className="discount-badge">
                  <span className="discount-percentage">{product.discount_percent}% OFF</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="product-details-name">{product.name}</h1>
              {product.brand?.name && <p className="product-brand-name">{product.brand.name}</p>}

              <div className="product-details-meta">
                <span
                  className="product-category"
                >
                  {product.category?.name || product.category}
                </span>
                <span className={`stock-badge ${stockInfo.className}`}>
                  {stockInfo.icon} {stockInfo.label}
                </span>
              </div>

              {sortedVariants.length > 0 && (
                <div className="variant-selector">
                  <h4 className="variant-selector-title">Select Variant</h4>
                  <div className="variant-chip-list">
                    {sortedVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className={`variant-chip ${selectedVariantId === variant.id ? 'active' : ''}`}
                        onClick={() => setSelectedVariantId(variant.id)}
                      >
                        <span>{variant.variant_name}</span>
                        <strong>₹{variant.price}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-rating">
                <span>{renderStars(ratingValue)}</span>
                <span>
                  ({ratingValue.toFixed(1)}) • {reviewsCount} reviews
                </span>
              </div>

              <div className="product-details-price-section">
                {hasDiscount ? (
                  <>
                    <div className="price-with-discount">
                      <span className="original-price">{formatPrice(selectedVariantPrice)}</span>
                      <span className="discounted-price">{formatPrice(discountedPrice)}</span>
                    </div>
                    <div className="savings-amount">You save {formatPrice(savings)}!</div>
                  </>
                ) : (
                  <div className="product-details-price">{formatPrice(selectedVariantPrice)}</div>
                )}
              </div>

              <div className="product-details-description">
                <h3>Details</h3>
                <p>{product.description || 'Fresh, high-quality groceries delivered with love. 💖'}</p>
              </div>

              <div className={`product-details-actions ${showCounter ? 'has-counter' : ''}`}>
                {showCounter ? (
                  <>
                    <div className="product-details-main-actions">
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
                          max={Math.min(99, selectedVariantStock)}
                          onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), Math.min(99, selectedVariantStock)))}
                          disabled={selectedVariantStock <= 0}
                        />
                        <button
                          className="qty-btn"
                          onClick={() => setQuantity(Math.min(Math.min(99, selectedVariantStock), quantity + 1))}
                          disabled={selectedVariantStock <= 0}
                        >+</button>
                      </div>

                      <Link
                        to="/cart"
                        className="btn-md btn-primary product-details-view-cart">
                        View Cart 🛒
                      </Link>
                    </div>
                  </>
                ) : (
                  <button
                    className="btn-add-cart"
                    onClick={handleAddToCart}
                    disabled={selectedVariantStock <= 0 || isAddingToCart}
                  >
                    {selectedVariantStock <= 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
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

      <div className="product-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviewSummary ? reviewSummary.total_reviews : product.reviews_count || 0})
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="tab-content">
            <div className="product-specs">
              <h3>Product Information</h3>
              <div>
                <div>
                  <strong>Reviews:</strong> {reviewsCount}
                </div>
                {selectedVariant?.variant_name && (
                  <div>
                    <strong>Variant:</strong> {selectedVariant.variant_name}
                  </div>
                )}
                {hasDiscount && (
                  <>
                    <div>
                      <strong>Effective price:</strong> {formatPrice(discountedPrice)}
                    </div>
                    <div>
                      <strong>Discount amount:</strong> {formatPrice(savings)}
                    </div>
                  </>
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

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="section-title">🧡 Related Products</h2>
          <div className="products-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}

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
            {product.emoji || product.category?.emoji || '📦'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
