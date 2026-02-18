import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { productsAPI } from '../api/products';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';

const Wishlist = () => {
  const dispatch = useDispatch();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, fetch some products as wishlist items
    const fetchWishlist = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 8 });
        // Mark first 4 as wishlisted
        const items = (response.data.results || response.data).slice(0, 4).map(p => ({ ...p, isWishlisted: true }));
        setWishlistItems(items);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = (productId) => {
    setWishlistItems(items => items.filter(item => item.id !== productId));
    toast.success('Removed from wishlist 💔');
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  if (loading) return <PageLoader />;

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your wishlist is empty 💝
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save items you love and they'll appear here
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
            <span>Explore Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">My Wishlist</span> 💝
          </h1>
          <span className="text-gray-600 dark:text-gray-400">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden group card-hover"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                  {product.emoji || categoryEmojis[product.category] || '📦'}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-md hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-gray-700/90 capitalize">
                    {categoryEmojis[product.category]} {product.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <Link to={`/shop?product=${product.id}`}>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-pink-500 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="p-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
