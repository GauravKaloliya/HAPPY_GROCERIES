import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { addToCart, selectCartItems } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showAddToCart = true }) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  
  const categoryColors = {
    fruits: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    vegetables: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dairy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    snacks: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    beverages: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      toast.success(`Added ${product.name} to cart! 🛒`);
      setQuantity(1);
    } catch (error) {
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

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 card-hover overflow-hidden">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-md hover:scale-110 transition-transform"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Category Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[product.category] || 'bg-gray-100'}`}>
          {categoryEmojis[product.category]} {product.category}
        </span>
      </div>

      {/* Product Image */}
      <Link to={`/shop?product=${product.id}`} className="block aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <div className="w-full h-full flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300">
          {product.emoji || categoryEmojis[product.category] || '📦'}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/shop?product=${product.id}`}>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-pink-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">
            ({product.review_count || 0})
          </span>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400"> / {product.unit || 'unit'}</span>
          </div>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ In Stock
            </span>
          ) : (
            <span className="text-xs text-red-500 font-medium">
              ✗ Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart Section */}
        {showAddToCart && product.stock > 0 && (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= 99 || quantity >= product.stock}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={inCart && inCart.quantity + quantity > product.stock}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold flex items-center justify-center space-x-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{inCart ? 'Add More' : 'Add to Cart'}</span>
            </button>
          </div>
        )}

        {inCart && (
          <div className="mt-3 text-center text-sm text-green-600 dark:text-green-400">
            ✓ {inCart.quantity} in cart
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
