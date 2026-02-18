import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ChevronRight, 
  Check,
  Package,
  Star
} from 'lucide-react';
import { ordersAPI } from '../api/orders';
import { 
  selectCartItems, 
  selectCartTotal,
  selectCartSubtotal,
  selectCartTax,
  selectDeliveryCharge,
  selectDiscount,
  clearCartState,
} from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const delivery = useSelector(selectDeliveryCharge);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);

  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some items before checking out
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => deliveryInfo[field].trim() !== '');
  };

  const handlePlaceOrder = async () => {
    if (!validateStep1()) {
      toast.error('Please fill in all delivery information');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        delivery_info: deliveryInfo,
        payment_method: paymentMethod,
        subtotal,
        tax,
        delivery_charge: delivery,
        discount,
        total,
      };

      const response = await ordersAPI.create(orderData);
      setOrderId(response.data.id);
      setOrderSuccess(true);
      dispatch(clearCartState());
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Order Placed! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your order
          </p>
          <p className="text-lg font-bold text-pink-500 mb-6">
            Order #{orderId}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We'll send you a confirmation email shortly. Your fresh groceries will be delivered soon!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="btn-secondary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Delivery', icon: MapPin },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review', icon: Star },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          <span className="gradient-text">Checkout</span> 🛍️
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  step >= s.number
                    ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                <s.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="glass rounded-2xl p-6 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={deliveryInfo.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={deliveryInfo.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={deliveryInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                    placeholder="123 Main Street, Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryInfo.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="NY"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={deliveryInfo.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="instructions"
                    value={deliveryInfo.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                    placeholder="Ring doorbell, leave at door, etc."
                  />
                </div>

                <button
                  onClick={() => validateStep1() ? setStep(2) : toast.error('Please fill in all required fields')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold text-lg hover:shadow-xl transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="glass rounded-2xl p-6 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-pink-500" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-pink-500 focus:ring-pink-400"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-gray-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-pink-500 focus:ring-pink-400"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-gray-900 dark:text-white">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay securely with your card</p>
                    </div>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold hover:shadow-xl transition-all"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass rounded-2xl p-6 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-pink-500" />
                  Review Your Order
                </h2>

                {/* Delivery Summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Delivery To:</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {deliveryInfo.firstName} {deliveryInfo.lastName}<br />
                    {deliveryInfo.address}<br />
                    {deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}<br />
                    {deliveryInfo.phone}
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Method:</h3>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {paymentMethod === 'cod' ? 'Cash on Delivery 💵' : 'Credit/Debit Card 💳'}
                  </p>
                </div>

                {/* Items Summary */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">Items ({items.length}):</h3>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.product?.emoji || '📦'}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : 'Place Order 🎉'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Order Summary
              </h2>

              {/* Items Preview */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <span className="text-2xl">{item.product?.emoji || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatPrice(item.product?.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
