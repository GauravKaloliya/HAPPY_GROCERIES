import { useDispatch } from 'react-redux';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const product = item.product || {};
  const price = product.price || item.price || 0;

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      toast.error('Maximum stock reached!');
      return;
    }
    
    try {
      await dispatch(updateCartItem({ itemId: item.id, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(removeFromCart(item.id)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
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
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      {/* Product Image */}
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-4xl flex-shrink-0">
        {product.emoji || categoryEmojis[product.category] || '📦'}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 dark:text-white truncate">
          {product.name || 'Product'}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {product.category}
        </p>
        <p className="font-bold text-pink-500 mt-1">
          {formatPrice(price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
          disabled={item.quantity >= product.stock}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Total & Remove */}
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-gray-900 dark:text-white">
          {formatPrice(price * item.quantity)}
        </p>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-600 text-sm flex items-center justify-end mt-1 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
