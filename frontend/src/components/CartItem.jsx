import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { formatPrice, getUnitLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const product = item.product || {};
  const displayPrice = parseFloat(product.price || item.price || 0);
  const mrp = parseFloat(product.mrp || displayPrice);
  const isOnSale = mrp > displayPrice;
  const discountPercent = isOnSale
    ? Math.round((1 - displayPrice / mrp) * 100)
    : 0;

  const handleUpdateQuantity = async (newQuantity) => {
    if (isUpdating) return;

    if (newQuantity <= 0) {
      await handleRemove();
      return;
    }
    if (newQuantity > product.stock) {
      toast.error('Maximum stock reached!');
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updateCartItem({ itemId: item.id, quantity: newQuantity })).unwrap();
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

  const categoryEmojis = {
    'fruits': '🍎',
    'vegetables': '🥬',
    'dairy': '🥛',
    'snacks': '🍪',
    'beverages': '🧃',
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {product.emoji || categoryEmojis[product.category?.name?.toLowerCase()] || '📦'}
      </div>

      <div className="cart-item-details">
        <h3>{product.name || 'Product'}</h3>

        {/* Unit & Pack Size */}
        {product.unit && (
          <div className="cart-item-unit" style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            {product.pack_size && `${product.pack_size} `}
            {getUnitLabel(product.unit)}
          </div>
        )}

        <div className="cart-item-price">
          {isOnSale ? (
            <>
              <span className="original-price">{formatPrice(mrp)}</span>
              {formatPrice(displayPrice)}
              <span className="item-discount-badge">
                -{discountPercent}%
              </span>
            </>
          ) : (
            formatPrice(displayPrice)
          )}
        </div>

        <div className="quantity-controls" style={{ marginTop: '0.5rem' }}>
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
            disabled={item.quantity >= product.stock || isUpdating}
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
