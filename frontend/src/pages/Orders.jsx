import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/orders';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useActivityLog('page_view', { section: 'orders' });

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

  const getStatusClass = (status) => {
    const classes = {
      pending: 'processing',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    return classes[status] || 'processing';
  };

  if (loading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet!</h3>
          <p>Start shopping to see your orders here</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2 className="section-title">📦 My Orders</h2>

      <div>
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <span className="order-id">Order #{order.id}</span>
                <p className="order-date">{formatDateTime(order.created_at)}</p>
              </div>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>

            <div className={`order-body ${expandedOrder === order.id ? 'active' : ''}`}>
              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="order-item-name">{item.product?.name || 'Product'}</span>
                    <span className="order-item-qty">x{item.quantity}</span>
                    <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-delivery">
                  <strong>Delivered to:</strong><br />
                  {order.delivery_address || 'No address provided'}
                </div>
                <div className="order-total">{formatPrice(order.total)}</div>
              </div>
            </div>

            <button 
              className={`toggle-order-btn ${expandedOrder === order.id ? 'active' : ''}`}
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
              <span className="arrow">▼</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
