import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, selectUser, selectAuthLoading } from '../store/slices/authSlice';
import { authAPI } from '../api/auth';
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
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [geoLoading, setGeoLoading] = useState(false);
  const initialDataRef = useRef(null);

  useActivityLog('page_view', { section: 'profile' });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user && !editing) {
      const data = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      };
      setFormData(data);
      initialDataRef.current = data;
    }
  }, [user, editing]);

  const isChanged = () => {
    if (!initialDataRef.current) return false;
    const init = initialDataRef.current;
    return (
      formData.first_name !== init.first_name ||
      formData.last_name !== init.last_name ||
      formData.email !== init.email ||
      formData.phone !== init.phone ||
      formData.address !== init.address
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: numeric }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneBlur = async () => {
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) return;
    if (formData.phone === (user?.phone || '')) return;
    try {
      const res = await authAPI.checkUsername(formData.phone);
      if (res.data.exists) {
        setFormErrors((prev) => ({ ...prev, phone: 'This phone number is already registered.' }));
      }
    } catch {
      // ignore
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) return;
    if (formData.email.toLowerCase() === (user?.email || '').toLowerCase()) return;
    try {
      const res = await authAPI.checkEmail(formData.email);
      if (res.data.exists) {
        setFormErrors((prev) => ({ ...prev, email: 'This email is already registered.' }));
      }
    } catch {
      // ignore
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.first_name.trim())) {
      errors.first_name = 'First name can only contain letters, spaces, hyphens and apostrophes';
    }

    if (formData.last_name && !/^[a-zA-Z\s'-]+$/.test(formData.last_name.trim())) {
      errors.last_name = 'Last name can only contain letters, spaces, hyphens and apostrophes';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }

    return errors;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setFormData((prev) => ({ ...prev, address: addr }));
          if (formErrors.address) {
            setFormErrors((prev) => ({ ...prev, address: '' }));
          }
        } catch {
          setFormData((prev) => ({ ...prev, address: `${latitude}, ${longitude}` }));
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        toast.error('Unable to retrieve your location');
        setGeoLoading(false);
      }
    );
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (formErrors.phone || formErrors.email) return;

    try {
      await dispatch(updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone,
        address: formData.address.trim() || null,
      })).unwrap();
      setEditing(false);
      toast.success('Profile updated successfully! ✨');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormErrors({});
    if (initialDataRef.current) {
      setFormData(initialDataRef.current);
    }
  };

  const handleEditClick = () => {
    const data = {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    };
    setFormData(data);
    initialDataRef.current = data;
    setFormErrors({});
    setEditing(true);
  };

  if (!user) return <PageLoader />;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.phone;

  const getInitials = (name) => {
    return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(displayName)}
            </div>
            <div className="profile-info">
              <h2>{displayName}</h2>
              <p className="profile-meta">
                Member since {formatDate(user.created_at || new Date())}
              </p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">First Name</span>
              {editing ? (
                <>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="Enter first name"
                  />
                  {formErrors.first_name && (
                    <div className="error-message show" style={{ marginTop: '0.25rem' }}>{formErrors.first_name}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{user.first_name || 'Not set'}</span>
              )}
            </div>

            <div className="detail-item">
              <span className="detail-label">Last Name</span>
              {editing ? (
                <>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="Enter last name (optional)"
                  />
                  {formErrors.last_name && (
                    <div className="error-message show" style={{ marginTop: '0.25rem' }}>{formErrors.last_name}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{user.last_name || 'Not set'}</span>
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
                    onBlur={handleEmailBlur}
                    className="profile-edit-input"
                    placeholder="Enter email (optional)"
                  />
                  {formErrors.email && (
                    <div className="error-message show" style={{ marginTop: '0.25rem' }}>{formErrors.email}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{user.email || 'Not set'}</span>
              )}
            </div>

            <div className="detail-item">
              <span className="detail-label">Phone</span>
              {editing ? (
                <>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handlePhoneBlur}
                    className="profile-edit-input"
                    placeholder="10-digit phone number"
                    maxLength="10"
                  />
                  {formErrors.phone && (
                    <div className="error-message show" style={{ marginTop: '0.25rem' }}>{formErrors.phone}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{user.phone || 'Not set'}</span>
              )}
            </div>

            <div className="detail-item">
              <span className="detail-label">Address</span>
              {editing ? (
                <>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="profile-edit-input"
                      placeholder="Enter your address (optional)"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={geoLoading}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'var(--primary-green)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        cursor: geoLoading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        whiteSpace: 'nowrap',
                        opacity: geoLoading ? 0.7 : 1,
                      }}
                      title="Get current location"
                    >
                      {geoLoading ? '⏳' : '📍'}
                    </button>
                  </div>
                  {formErrors.address && (
                    <div className="error-message show" style={{ marginTop: '0.25rem' }}>{formErrors.address}</div>
                  )}
                </>
              ) : (
                <span className="detail-value">{user.address || 'Not set'}</span>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn-submit"
                  disabled={loading || !isChanged()}
                  style={{ opacity: isChanged() ? 1 : 0.5, cursor: isChanged() ? 'pointer' : 'not-allowed' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={handleEditClick} className="btn-submit">
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
              <h3>Coupons Used</h3>
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
