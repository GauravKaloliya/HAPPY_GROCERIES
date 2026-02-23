import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, selectUser, selectAuthLoading } from '../store/slices/authSlice';
import { formatDate } from '../utils/helpers';
import { authAPI } from '../api/auth';
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
  const [initialFormData, setInitialFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useActivityLog('page_view', { section: 'profile' });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Sync form data when user data changes (but not during editing)
  useEffect(() => {
    if (user && !editing) {
      const data = {
        name: user.name || user.first_name + ' ' + user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      };
      setFormData(data);
      setInitialFormData(data);
    }
  }, [user, editing]);

  const hasChanges = () => {
    return (
      formData.name !== initialFormData.name ||
      formData.email !== initialFormData.email ||
      formData.phone !== initialFormData.phone ||
      formData.address !== initialFormData.address
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Only allow numbers
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length > 10) {
        setPhoneError('Phone number must be exactly 10 digits');
      } else {
        setPhoneError('');
      }
      setFormData({ ...formData, [name]: numbersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.display_name) {
            setFormData({ ...formData, address: data.display_name });
            toast.success('Location fetched successfully!');
          } else {
            toast.error('Unable to get address from location');
          }
        } catch {
          toast.error('Failed to fetch address');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        toast.error('Unable to get your location. Please enable location access.');
      }
    );
  };

  const handleEmailBlur = async () => {
    const email = formData.email;
    if (!email || email === (user.email || '')) return;

    setCheckingEmail(true);
    try {
      const response = await authAPI.checkEmail(email);
      const { available, message } = response.data;
      setEmailStatus(available ? { available: true, message } : { available: false, message });
    } catch {
      // Silent fail
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSave = async () => {
    // Validate phone number
    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    // Validate email format if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditing(false);
      toast.success('Profile updated successfully! ✨');
    } catch {
      toast.error('Failed to update profile');
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
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="profile-edit-input"
                />
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
                    onBlur={handleEmailBlur}
                    className="profile-edit-input"
                  />
                  {checkingEmail && <span style={{ fontSize: '0.75rem', color: '#888' }}>Checking...</span>}
                  {emailStatus && !emailStatus.available && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{emailStatus.message}</span>
                  )}
                </>
              ) : (
                <span className="detail-value">{formData.email || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              {editing ? (
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                  {phoneError && <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '0.25rem' }}>{phoneError}</span>}
                </div>
              ) : (
                <span className="detail-value">{formData.phone || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Address</span>
              {editing ? (
                <div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="Enter your address"
                    style={{ width: 'calc(100% - 120px)', marginRight: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="btn-secondary"
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      minWidth: '110px',
                      opacity: locationLoading ? 0.7 : 1,
                      cursor: locationLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {locationLoading ? '📍...' : '📍 Get Location'}
                  </button>
                </div>
              ) : (
                <span className="detail-value">{formData.address || 'Not set'}</span>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn-submit"
                  disabled={loading || !hasChanges() || phoneError}
                  style={{
                    opacity: hasChanges() && !phoneError ? 1 : 0.5,
                    cursor: hasChanges() && !phoneError ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary">
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
              <div className="summary-value">{user.order_count || 0}</div>
              <Link to="/orders" className="summary-link">View Orders →</Link>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">❤️</div>
            <div className="summary-content">
              <h3>Wishlist</h3>
              <div className="summary-value">{user.wishlist_count || 0}</div>
              <Link to="/wishlist" className="summary-link">View Wishlist →</Link>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">🎁</div>
            <div className="summary-content">
              <h3>Coupons</h3>
              <div className="summary-value">{user.coupon_count || 0}</div>
              <Link to="/shop" className="summary-link">Shop Now →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
