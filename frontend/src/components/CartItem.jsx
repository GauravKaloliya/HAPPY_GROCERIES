import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const product = item.product || {};
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const sortedVariants = [...variants].sort((a, b) => {
    const normalizeUnit = (variant) => {
      const unitType = (variant.unit_type || '').toLowerCase();
      const rawValue = Number(variant.unit_value ?? 0);
      if (unitType === 'kg' || unitType === 'liter' || unitType === 'l') return rawValue * 1000;
      return rawValue;
    };
    const aUnit = normalizeUnit(a);
    const bUnit = normalizeUnit(b);
    if (aUnit !== bUnit) return aUnit - bUnit;
    return Number(a.price ?? 0) - Number(b.price ?? 0);
  });
  const selectedVariant = item.variant
    || sortedVariants.find((v) => v.id === item.variant_id)
    || product.default_variant
    || sortedVariants[0]
    || null;
  const basePrice = parseFloat(selectedVariant?.price || product.price || item.price || 0);
  const discountPercent = parseFloat(product.discount_percent || 0) || 0;
  const effectivePrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
  const isOnSale = effectivePrice < basePrice;
  const displayPrice = isOnSale ? effectivePrice : basePrice;
  const categoryName = product.category?.name || product.category || '';
  const brandName = product.brand?.name || product.brand_name || '';
  const defaultVariantLabel = selectedVariant?.variant_name || '';

  const handleUpdateQuantity = async (newQuantity) => {
    if (isUpdating) return;

    if (newQuantity <= 0) {
      await handleRemove();
      return;
    }
    const maxStock = selectedVariant?.stock_quantity ?? product.stock;
    if (maxStock !== undefined && maxStock !== null && newQuantity > maxStock) {
      toast.error('Maximum stock reached!');
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updateCartItem({ itemId: item.id, quantity: newQuantity, variantId: selectedVariant?.id ?? null })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await dispatch(removeFromCart(item.id)).unwrap();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err || 'Failed to remove item');
      setIsRemoving(false);
    }
  };

  const handleVariantChange = async (variantId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await dispatch(updateCartItem({
        itemId: item.id,
        quantity: item.quantity,
        variantId,
      })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update variant');
    } finally {
      setIsUpdating(false);
    }
  };

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {product.emoji || categoryEmojis[categoryName?.toLowerCase?.()] || '📦'}
      </div>

      <div className="cart-item-details">
        <h3>{product.name || 'Product'}</h3>
        {(brandName || defaultVariantLabel) && (
          <p className="cart-item-meta">
            {[brandName, defaultVariantLabel].filter(Boolean).join(' • ')}
          </p>
        )}
        <div className="cart-item-price">
          {isOnSale ? (
            <>
              <span className="original-price">{formatPrice(basePrice)}</span>
              {formatPrice(displayPrice)}
              <span className="item-discount-badge">
                -{Math.round((1 - displayPrice / basePrice) * 100)}%
              </span>
            </>
          ) : (
            formatPrice(basePrice)
          )}
        </div>

        {sortedVariants.length > 0 && (
          <div className="cart-variant-select">
            <label htmlFor={`cart-variant-${item.id}`}>Size</label>
            <select
              id={`cart-variant-${item.id}`}
              value={selectedVariant?.id || ''}
              onChange={(e) => handleVariantChange(Number(e.target.value))}
              disabled={isUpdating}
            >
              {sortedVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.variant_name} • {formatPrice(variant.price)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="quantity-controls cart-item-qty-controls">
          <button
            className="qty-btn"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={isUpdating}
          >
            −
          </button>
          <input
            type="text"
            className="qty-input"
            value={item.quantity}
            readOnly
          />
          <button
            className="qty-btn"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating || (selectedVariant?.stock_quantity ?? product.stock) <= item.quantity}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item-actions">
        <div className="item-total">
          {formatPrice(displayPrice * item.quantity)}
        </div>
        <button onClick={handleRemove} className="btn-remove" disabled={isRemoving}>
          {isRemoving ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

export default CartItem;
