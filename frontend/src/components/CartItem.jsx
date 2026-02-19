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
  const price = parseFloat(product.price || item.price || 0);
  const effectivePrice = parseFloat(product.effective_price || price);
  const isOnSale = effectivePrice < price;
  const displayPrice = isOnSale ? effectivePrice : price;

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
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {product.emoji || categoryEmojis[product.category] || '📦'}
      </div>

      <div className="cart-item-details">
        <h3>{product.name || 'Product'}</h3>
        <div className="cart-item-price">
          {isOnSale ? (
            <>
              <span className="original-price">{formatPrice(price)}</span>
              {formatPrice(displayPrice)}
              <span className="item-discount-badge">
                -{Math.round((1 - displayPrice / price) * 100)}%
              </span>
            </>
          ) : (
            formatPrice(price)
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
        <div style={{ fontWeight: 700, color: 'var(--primary-pink)', fontSize: '1.2rem' }}>
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
