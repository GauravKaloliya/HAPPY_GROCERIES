import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import { showToast } from '../components/UI/Toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState({ total_orders: 0, total_spent: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      showToast('Profile updated successfully!');
      setIsEditing(false);
    } else {
      showToast(result.error || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (!user) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="profile-container">
      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(user.name)}
          </div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="profile-meta">
              📱 {user.phone}<br />
              📧 {user.email || 'No email added'}
            </p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="profile-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Member Since</span>
                <span className="detail-value">
                  {new Date(user.date_joined).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn-primary btn-full" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="profile-summary">
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-content">
            <h3>Total Orders</h3>
            <p className="summary-value">{stats.total_orders}</p>
            <Link to="/orders" className="summary-link">View Orders →</Link>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>Total Spent</h3>
            <p className="summary-value">₹{stats.total_spent.toFixed(0)}</p>
            <Link to="/orders" className="summary-link">View History →</Link>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💖</div>
          <div className="summary-content">
            <h3>Wishlist</h3>
            <p className="summary-value">Items</p>
            <Link to="/wishlist" className="summary-link">View Wishlist →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
