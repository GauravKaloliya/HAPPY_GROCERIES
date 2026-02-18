import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, MapPin, CreditCard } from 'lucide-react';
import { ordersAPI } from '../api/orders';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { PageLoader, SkeletonCard } from '../components/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll();
        setOrders(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
    };
    return emojis[status] || '📋';
  };

  if (loading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No orders yet! 📭
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Start shopping to see your orders here
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
            <span>Start Shopping</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          <span className="gradient-text">My Orders</span> 📦
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass rounded-2xl overflow-hidden card-hover"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                    {getStatusEmoji(order.status)} {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6">
                <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                  {order.items?.slice(0, 4).map((item, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-3xl"
                    >
                      {item.product?.emoji || '📦'}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {order.items?.length || 0} items
                    </span>
                    <span className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.total)}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className={`w-5 h-5 transition-transform ${selectedOrder === order.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              {selectedOrder === order.id && (
                <div className="px-6 pb-6 animate-fade-in">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3">Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{item.product?.emoji || '📦'}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.product?.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Delivery Address
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {order.delivery_address || 'No address provided'}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Tax</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Delivery</span>
                          <span>{formatPrice(order.delivery_charge)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span>Total</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
