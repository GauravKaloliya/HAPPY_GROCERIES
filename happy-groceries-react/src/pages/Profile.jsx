import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Profile.css';

const Profile = () => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const { cartCount } = useCart();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    if (!isAuthenticated) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="login-required">
                        <h2>Login Required</h2>
                        <p>Please log in to view your profile.</p>
                        <Link to="/login" className="btn btn-primary">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        const result = await updateProfile(formData);
        if (result.success) {
            setEditMode(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
        setEditMode(false);
    };

    return (
        <div className="profile-page">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{user?.name || 'User'}</h1>
                        <p className="profile-email">{user?.email || 'No email provided'}</p>
                        <p className="profile-phone">{user?.phone || 'No phone provided'}</p>
                    </div>
                </div>

                {/* Profile Navigation */}
                <div className="profile-nav">
                    <button
                        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        📦 Orders
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wishlist')}
                    >
                        💝 Wishlist
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'addresses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('addresses')}
                    >
                        📍 Addresses
                    </button>
                </div>

                {/* Profile Content */}
                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h3>Personal Information</h3>
                                {!editMode && (
                                    <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}>
                                        ✏️ Edit
                                    </button>
                                )}
                            </div>
                            
                            {editMode ? (
                                <div className="profile-form">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled
                                        />
                                        <small className="form-help">Phone number cannot be changed</small>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button className="btn btn-primary" onClick={handleSave}>
                                            💾 Save Changes
                                        </button>
                                        <button className="btn btn-outline" onClick={handleCancel}>
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-details">
                                    <div className="detail-item">
                                        <label>Full Name</label>
                                        <span>{user?.name || 'Not provided'}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <span>{user?.email || 'Not provided'}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <label>Phone Number</label>
                                        <span>{user?.phone || 'Not provided'}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <label>Member Since</label>
                                        <span>December 2024</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h3>Order History</h3>
                                <Link to="/orders" className="btn btn-outline btn-sm">
                                    View All Orders
                                </Link>
                            </div>
                            
                            <div className="orders-summary">
                                <div className="stat-card">
                                    <div className="stat-icon">📦</div>
                                    <div className="stat-info">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Total Orders</div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-info">
                                        <div className="stat-number">₹0</div>
                                        <div className="stat-label">Total Spent</div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">🎁</div>
                                    <div className="stat-info">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Coupons Used</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="empty-state">
                                <div className="empty-icon">📦</div>
                                <h4>No orders yet</h4>
                                <p>Start shopping to see your orders here!</p>
                                <Link to="/products" className="btn btn-primary">
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h3>My Wishlist</h3>
                                <Link to="/wishlist" className="btn btn-outline btn-sm">
                                    View Full Wishlist
                                </Link>
                            </div>
                            
                            <div className="wishlist-summary">
                                <div className="stat-card">
                                    <div className="stat-icon">💝</div>
                                    <div className="stat-info">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Items Saved</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="empty-state">
                                <div className="empty-icon">💝</div>
                                <h4>No items in wishlist</h4>
                                <p>Save your favorite items to view them here!</p>
                                <Link to="/products" className="btn btn-primary">
                                    Browse Products
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h3>Saved Addresses</h3>
                                <button className="btn btn-primary btn-sm">
                                    ➕ Add Address
                                </button>
                            </div>
                            
                            <div className="empty-state">
                                <div className="empty-icon">📍</div>
                                <h4>No saved addresses</h4>
                                <p>Add an address for faster checkout!</p>
                                <button className="btn btn-primary">
                                    Add Address
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;