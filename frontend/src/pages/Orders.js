import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return { background: 'var(--primary-yellow)', color: 'var(--text-dark)' };
      case 'confirmed': return { background: 'var(--primary-blue)', color: 'var(--text-dark)' };
      case 'shipped': return { background: 'var(--primary-orange)', color: 'var(--text-dark)' };
      case 'delivered': return { background: 'var(--primary-green)', color: 'var(--text-dark)' };
      case 'cancelled': return { background: '#ff4444', color: 'white' };
      default: return { background: 'var(--primary-yellow)', color: 'var(--text-dark)' };
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to place your first order!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1 className="section-title">📦 Your Orders</h1>

      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <div>
              <span className="order-id">Order #{order.id}</span>
              <p className="order-date">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <span 
              className="order-status"
              style={getStatusColor(order.status)}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: index < order.items.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
              }}>
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '2px solid rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{order.estimated_delivery}</p>
            </div>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-pink)' }}>
              Total: ₹{order.total.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
