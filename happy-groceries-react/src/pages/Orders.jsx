import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Profile.css';

const Orders = () => {
    const { isAuthenticated, user } = useAuth();
    const { cartCount } = useCart();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Load orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('happyGroceries_orders') || '[]');
        const userOrders = savedOrders.filter(order => order.userId === user?.id);
        setOrders(userOrders);
    }, [user]);

    if (!isAuthenticated) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="login-required">
                        <h2>Login Required</h2>
                        <p>Please log in to view your orders.</p>
                        <Link to="/login" className="btn btn-primary">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return '#27ae60';
            case 'preparing':
                return '#f39c12';
            case 'out-for-delivery':
                return '#3498db';
            case 'delivered':
                return '#2ecc71';
            case 'cancelled':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    };

    return (
        <div className="orders-page">
            <div className="container">
                <div className="orders-header">
                    <h1 className="orders-title">My Orders</h1>
                    <p className="orders-subtitle">
                        Track and manage your orders
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-orders-icon">📦</div>
                        <h3 className="empty-orders-title">No orders yet</h3>
                        <p className="empty-orders-message">
                            You haven't placed any orders yet. Start shopping to see your orders here!
                        </p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-content">
                        <div className="orders-summary">
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <div className="stat-number">{orders.length}</div>
                                    <div className="stat-label">Total Orders</div>
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <div className="stat-number">
                                        ₹{orders.reduce((total, order) => total + order.pricing.total, 0).toFixed(0)}
                                    </div>
                                    <div className="stat-label">Total Spent</div>
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-icon">🎁</div>
                                <div className="stat-info">
                                    <div className="stat-number">
                                        {orders.filter(order => order.pricing.couponDiscount > 0).length}
                                    </div>
                                    <div className="stat-label">Orders with Coupons</div>
                                </div>
                            </div>
                        </div>

                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h3 className="order-number">Order #{order.id}</h3>
                                            <p className="order-date">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="order-status">
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                            >
                                                {order.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.items.slice(0, 3).map(item => (
                                            <div key={item.id} className="order-item">
                                                <span className="item-emoji">{item.emoji}</span>
                                                <div className="item-details">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-quantity">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="more-items">
                                                +{order.items.length - 3} more items
                                            </div>
                                        )}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-total">
                                            <span className="total-label">Total: </span>
                                            <span className="total-amount">₹{order.pricing.total.toFixed(0)}</span>
                                        </div>
                                        <div className="order-actions">
                                            <button className="btn btn-outline btn-sm">
                                                View Details
                                            </button>
                                            <button className="btn btn-primary btn-sm">
                                                Reorder
                                            </button>
                                        </div>
                                    </div>

                                    {order.estimatedDelivery && (
                                        <div className="delivery-info">
                                            <span className="delivery-icon">🚚</span>
                                            <span className="delivery-text">{order.estimatedDelivery}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;