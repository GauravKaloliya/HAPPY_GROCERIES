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
    <div className="container">
      <div className="orders-container">
        <h2 className="section-title">📦 My Orders</h2>

        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order.order_id}</span>
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
                      <div className="order-item-info">
                        <span className="order-item-name">{item.product_name || 'Product'}</span>
                        <span className="order-item-qty">x{item.quantity}</span>
                      </div>
                      <div className="order-item-price-info">
                        <span className="order-item-price">{formatPrice(item.product_price * item.quantity)}</span>
                        {item.discount_percent > 0 && (
                          <span className="order-item-discount">
                            -{item.discount_percent}% off
                            {item.applied_discount_amount > 0 && ` (${formatPrice(item.applied_discount_amount)})`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-delivery">
                    <strong>Delivered to:</strong><br />
                    {order.delivery_name}<br />
                    {order.delivery_phone}<br />
                    {order.delivery_address || 'No address provided'}
                  </div>
                  <div className="order-pricing">
                    <div className="order-pricing-row">
                      <span>Subtotal:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.applied_discount_amount > 0 && (
                      <div className="order-pricing-row discount">
                        <span>Product Discounts:</span>
                        <span>-{formatPrice(order.applied_discount_amount)}</span>
                      </div>
                    )}
                    {order.coupon_discount > 0 && (
                      <div className="order-pricing-row discount">
                        <span>Coupon Discount:</span>
                        <span>-{formatPrice(order.coupon_discount)}</span>
                      </div>
                    )}
                    <div className="order-pricing-row">
                      <span>Delivery:</span>
                      <span>{formatPrice(order.delivery_charge)}</span>
                    </div>
                    <div className="order-pricing-row">
                      <span>Tax:</span>
                      <span>{formatPrice(order.tax)}</span>
                    </div>
                    <div className="order-pricing-row total">
                      <strong>Total:</strong>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </div>
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
    </div>
  );
};

export default Orders;
