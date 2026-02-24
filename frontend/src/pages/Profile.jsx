import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, selectUser, selectAuthLoading } from '../store/slices/authSlice';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useActivityLog('page_view', { section: 'profile' });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (user && !editing) {
      setFormData({
        name: user.name || user.first_name + ' ' + user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, editing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: numeric });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditing(false);
      setFormErrors({});
      toast.success('Profile updated successfully! ✨');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormErrors({});
    if (user) {
      setFormData({
        name: user.name || user.first_name + ' ' + user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  };

  if (!user) return <PageLoader />;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(formData.name || user.name || user.first_name + ' ' + user.last_name)}
            </div>
            <div className="profile-info">
              <h2>{formData.name || user.name || user.first_name + ' ' + user.last_name}</h2>
              <p className="profile-meta">
                Member since {formatDate(user.date_joined || user.created_at || new Date())}
              </p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              {editing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                  />
                  {formErrors.name && (
                    <div className="error-message show">{formErrors.name}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{formData.name || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              {editing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                  />
                  {formErrors.email && (
                    <div className="error-message show">{formErrors.email}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{formData.email || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              {editing ? (
                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                  maxLength="10"
                  disabled
                  style={{ background: 'var(--bg-light)', opacity: 0.7 }}
                />
              ) : (
                <span className="detail-value">{formData.phone || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Address</span>
              {editing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                />
              ) : (
                <span className="detail-value">{formData.address || 'Not set'}</span>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button onClick={handleSave} className="btn-submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-submit">
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-summary">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <div className="summary-content">
              <h3>Total Orders</h3>
              <div className="summary-value">{user.order_count ?? 0}</div>
              <Link to="/orders" className="summary-link">View Orders →</Link>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">❤️</div>
            <div className="summary-content">
              <h3>Wishlist</h3>
              <div className="summary-value">{user.wishlist_count ?? 0}</div>
              <Link to="/wishlist" className="summary-link">View Wishlist →</Link>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">🎁</div>
            <div className="summary-content">
              <h3>Coupons</h3>
              <div className="summary-value">{user.coupon_count ?? 0}</div>
              <Link to="/shop" className="summary-link">Shop Now →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
