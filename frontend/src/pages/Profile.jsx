import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, selectUser, selectAuthLoading } from '../store/slices/authSlice';
import { authAPI } from '../api/auth';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /\d/.test(p), label: 'One number' },
  { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'One special character' },
];

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
  const [initialData, setInitialData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [counts, setCounts] = useState({
    orders: 0,
    wishlist: 0,
    coupons: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [validationStatus, setValidationStatus] = useState({
    email: { checking: false, available: null },
    phone: { checking: false, available: null },
  });

  useActivityLog('page_view', { section: 'profile' });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user && !editing) {
      const data = {
        name: user.name || user.first_name + ' ' + user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [user, editing]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;
      setCountsLoading(true);
      try {
        const statsRes = await authAPI.getStats();
        if (statsRes.data) {
          setCounts({
            orders: statsRes.data.orders ?? 0,
            wishlist: statsRes.data.wishlist ?? 0,
            coupons: statsRes.data.coupons ?? 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Keep previous values on error, don't reset to 0
      } finally {
        setCountsLoading(false);
      }
    };
    fetchCounts();
  }, [user]);

  const hasChanges = () => {
    return (
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.address !== initialData.address
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    if (name === 'email') {
      setValidationStatus(prev => ({ ...prev, email: { checking: false, available: null } }));
    }
    if (name === 'phone') {
      setValidationStatus(prev => ({ ...prev, phone: { checking: false, available: null } }));
    }
  };

  const handleEmailBlur = async () => {
    const email = formData.email;
    if (!email || email === initialData.email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    
    setValidationStatus(prev => ({ ...prev, email: { checking: true, available: null } }));
    try {
      const response = await authAPI.checkEmail(email);
      const available = response.data.available;
      setValidationStatus(prev => ({ ...prev, email: { checking: false, available } }));
      if (!available) {
        setFormErrors(prev => ({ ...prev, email: response.data.message }));
      }
    } catch {
      setValidationStatus(prev => ({ ...prev, email: { checking: false, available: null } }));
    }
  };

  const handlePhoneBlur = async () => {
    const phone = formData.phone;
    if (!phone || phone === initialData.phone) return;
    if (!/^\d{10}$/.test(phone)) return;
    
    setValidationStatus(prev => ({ ...prev, phone: { checking: true, available: null } }));
    try {
      const response = await authAPI.checkPhone(phone);
      const available = response.data.available;
      setValidationStatus(prev => ({ ...prev, phone: { checking: false, available } }));
      if (!available) {
        setFormErrors(prev => ({ ...prev, phone: response.data.message }));
      }
    } catch {
      setValidationStatus(prev => ({ ...prev, phone: { checking: false, available: null } }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters, spaces, hyphens and apostrophes';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.length > 500) {
      errors.address = 'Address must be less than 500 characters';
    }
    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      } else if (formData.email.length > 254) {
        errors.email = 'Email must be less than 254 characters';
      }
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const nameParts = formData.name.trim().split(' ').filter(Boolean);
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ');
      
      await dispatch(updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        address: formData.address,
      })).unwrap();
      setEditing(false);
      setInitialData(formData);
      toast.success('Profile updated successfully! ✨');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setFormErrors({});
    setValidationStatus({ email: { checking: false, available: null }, phone: { checking: false, available: null } });
    setEditing(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
            toast.success('Location fetched successfully! 📍');
          }
        } catch {
          setFormData(prev => ({ ...prev, address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` }));
          toast.success('Coordinates captured! 📍');
        }
      },
      () => {
        toast.error('Unable to retrieve your location');
      }
    );
  };

  if (!user) return <PageLoader />;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const getValidationIcon = (field) => {
    const status = validationStatus[field];
    if (status.checking) return '⏳';
    if (status.available === true) return '✅';
    if (status.available === false) return '❌';
    return null;
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
              <span className="detail-label">Full Name *</span>
              {editing ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`profile-edit-input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="Enter your full name"
                    maxLength="100"
                    required
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>
              ) : (
                <span className="detail-value">{formData.name || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              {editing ? (
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    className={`profile-edit-input ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    maxLength="254"
                    style={{ paddingRight: validationStatus.email.available !== null ? '2.5rem' : undefined }}
                  />
                  {getValidationIcon('email') && (
                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                      {getValidationIcon('email')}
                    </span>
                  )}
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>
              ) : (
                <span className="detail-value">{formData.email || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              {editing ? (
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handlePhoneBlur}
                    className={`profile-edit-input ${formErrors.phone ? 'input-error' : ''}`}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                    style={{ paddingRight: validationStatus.phone.available !== null ? '2.5rem' : undefined }}
                  />
                  {getValidationIcon('phone') && (
                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                      {getValidationIcon('phone')}
                    </span>
                  )}
                  {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                </div>
              ) : (
                <span className="detail-value">{formData.phone || 'Not set'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Address *</span>
              {editing ? (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="profile-edit-input"
                      placeholder="Enter your address"
                      maxLength="500"
                      style={{ flex: 1 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="btn-location"
                      title="Get current location"
                    >
                      📍
                    </button>
                  </div>
                  {formErrors.address && <span className="field-error">{formErrors.address}</span>}
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
                  disabled={loading || !hasChanges()}
                  style={{ opacity: hasChanges() ? 1 : 0.5 }}
                >
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
              <div className="summary-value">
                {countsLoading ? '...' : counts.orders}
              </div>
              <Link to="/orders" className="summary-link">View Orders →</Link>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">❤️</div>
            <div className="summary-content">
              <h3>Wishlist</h3>
              <div className="summary-value">
                {countsLoading ? '...' : counts.wishlist}
              </div>
              <Link to="/wishlist" className="summary-link">View Wishlist →</Link>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">🎁</div>
            <div className="summary-content">
              <h3>Available Coupons</h3>
              <div className="summary-value">
                {countsLoading ? '...' : counts.coupons}
              </div>
              <Link to="/offers" className="summary-link">View Offers →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
