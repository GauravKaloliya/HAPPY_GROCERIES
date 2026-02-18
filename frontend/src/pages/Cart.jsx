import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, ArrowRight, Tag, Truck, Trash2 } from 'lucide-react';
import CartItem from '../components/CartItem';
import { 
  fetchCart, 
  clearCart, 
  selectCartItems, 
  selectCartSubtotal,
  selectCartTax,
  selectDeliveryCharge,
  selectCartTotal,
  selectDiscount,
  setCoupon,
  clearCoupon,
  applyCoupon,
} from '../store/slices/cartSlice';
import { COUPONS } from '../utils/constants';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const delivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);
  const appliedCoupon = useSelector(state => state.cart.appliedCoupon);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await dispatch(fetchCart()).unwrap();
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [dispatch]);

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Cart cleared! 🗑️');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    const coupon = COUPONS.find(c => c.code === couponCode.toUpperCase());
    
    if (!coupon) {
      toast.error('Invalid coupon code! 😕');
      return;
    }

    if (subtotal < coupon.minOrder) {
      toast.error(`Minimum order of ${formatPrice(coupon.minOrder)} required`);
      return;
    }

    dispatch(applyCoupon(coupon));
    toast.success(`Coupon applied! You saved ${coupon.type === 'percentage' ? coupon.discount + '%' : formatPrice(coupon.discount)} 🎉`);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCoupon());
    toast.success('Coupon removed');
  };

  if (loading) return <PageLoader />;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce-gentle">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added anything yet. Let's fix that! 🛍️
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
            <span>Start Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          <span className="gradient-text">Shopping Cart</span> 🛒
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
              <button
                onClick={handleClearCart}
                className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cart</span>
              </button>
            </div>

            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 text-pink-500 font-medium hover:text-pink-600 transition-colors mt-6"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order Summary
              </h2>

              {/* Coupon Input */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Have a coupon? 🎁
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div>
                      <span className="font-bold text-green-700 dark:text-green-400">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {appliedCoupon.type === 'percentage' 
                          ? `${appliedCoupon.discount}% off` 
                          : `$${appliedCoupon.discount} off`}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g., SAVE20)"
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Discount
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    Delivery
                  </span>
                  <span>
                    {delivery === 0 ? (
                      <span className="text-green-600 font-medium">FREE 🎉</span>
                    ) : (
                      formatPrice(delivery)
                    )}
                  </span>
                </div>

                {delivery === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    ✓ You got free delivery!
                  </p>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex items-center justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Available Coupons */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available Coupons:
                </p>
                <div className="space-y-2">
                  {COUPONS.slice(0, 3).map((coupon) => (
                    <div
                      key={coupon.code}
                      onClick={() => setCouponCode(coupon.code)}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-500 text-sm">{coupon.code}</span>
                        <span className="text-xs text-gray-500">
                          {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`} off
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Min: {formatPrice(coupon.minOrder)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
