import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser, selectIsAuthenticated, updateProfile, changePassword } from '../store/slices/authSlice';
import { toggleTheme, selectIsDarkMode } from '../store/slices/themeSlice';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /\d/.test(p), label: 'One number' },
  { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'One special character' },
];

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isDarkMode = useSelector(selectIsDarkMode);

  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);

  useActivityLog('page_view', { section: 'settings' });

  const initialProfileRef = useRef({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [validationStatus, setValidationStatus] = useState({
    email: { checking: false, available: null },
    phone: { checking: false, available: null },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalOffers: false,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (user) {
      const initial = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      };
      initialProfileRef.current = initial;
      setProfileForm(initial);
    }

    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      setNotifications(JSON.parse(savedPrefs));
    }
  }, [user]);

  const isProfileChanged = () => {
    const initial = initialProfileRef.current;
    return (
      profileForm.first_name !== initial.first_name ||
      profileForm.last_name !== initial.last_name ||
      profileForm.email !== initial.email ||
      profileForm.address !== initial.address
    );
  };

  const getFieldBorderStyle = (fieldName) => {
    const initial = initialProfileRef.current;
    const isChanged = profileForm[fieldName] !== initial[fieldName];
    return isChanged ? { border: '2px solid var(--primary-pink)', background: 'var(--bg-white)' } : {};
  };

  const isPasswordChanged = () => {
    return (
      passwordForm.currentPassword.trim() !== '' ||
      passwordForm.newPassword.trim() !== '' ||
      passwordForm.confirmPassword.trim() !== ''
    );
  };

  const handleProfileChange = (field, value) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setProfileForm({ ...profileForm, phone: numericValue });
    } else {
      setProfileForm({ ...profileForm, [field]: value });
    }
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
    if (field === 'email') {
      setValidationStatus(prev => ({ ...prev, email: { checking: false, available: null } }));
    }
    if (field === 'phone') {
      setValidationStatus(prev => ({ ...prev, phone: { checking: false, available: null } }));
    }
  };

  const handleEmailBlur = async () => {
    const email = profileForm.email;
    if (!email || email === initialProfileRef.current.email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setFormErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
      return;
    }
    
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
    const phone = profileForm.phone;
    if (!phone || phone === initialProfileRef.current.phone) return;
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

  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.first_name.trim()) {
      errors.first_name = 'First name is required';
    } else if (profileForm.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    } else if (profileForm.first_name.trim().length > 150) {
      errors.first_name = 'First name must be less than 150 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(profileForm.first_name.trim())) {
      errors.first_name = 'First name can only contain letters, spaces, hyphens and apostrophes';
    }
    if (profileForm.last_name && !/^[a-zA-Z\s'-]+$/.test(profileForm.last_name.trim())) {
      errors.last_name = 'Last name can only contain letters, spaces, hyphens and apostrophes';
    }
    if (profileForm.last_name && profileForm.last_name.length > 150) {
      errors.last_name = 'Last name must be less than 150 characters';
    }
    if (profileForm.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(profileForm.email)) {
        errors.email = 'Enter a valid email address';
      } else if (profileForm.email.length > 254) {
        errors.email = 'Email must be less than 254 characters';
      }
    }
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    if (profileForm.address && profileForm.address.length > 500) {
      errors.address = 'Address must be less than 500 characters';
    }
    return errors;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);

    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      initialProfileRef.current = { ...profileForm };
      toast.success('Profile updated successfully! ✅');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const failedRules = PASSWORD_RULES.filter(rule => !rule.test(passwordForm.newPassword));
    if (failedRules.length > 0) {
      toast.error(`Password must have: ${failedRules.map(r => r.label).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await dispatch(changePassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })).unwrap();

      toast.success('Password changed successfully! 🔒');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('userPreferences', JSON.stringify(updated));
    toast.success('Preferences saved! ✅');
  };

  const handleClearData = () => {
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('cart');
    toast.success('All data cleared successfully! ✅');
    setShowClearDataModal(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not available. Please contact support.');
    setShowDeleteModal(false);
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
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
            setProfileForm(prev => ({ ...prev, address: data.display_name }));
            toast.success('Location fetched successfully! 📍');
          }
        } catch {
          setProfileForm(prev => ({ ...prev, address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` }));
          toast.success('Coordinates captured! 📍');
        }
      },
      () => {
        toast.error('Unable to retrieve your location');
      }
    );
  };

  const getValidationIcon = (field) => {
    const status = validationStatus[field];
    if (status.checking) return '⏳';
    if (status.available === true) return '✅';
    if (status.available === false) return '❌';
    return null;
  };

  const navItems = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
          <h2>Please login to access settings</h2>
          <p>You need to be logged in to manage your settings</p>
          <Link to="/login" className="btn-lg btn-primary" style={{ marginTop: '1rem' }}>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Link to="/profile" className="back-link">← Back to Profile</Link>
      <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>⚙️ Settings</h1>

      <div className="settings-layout">
        <aside className="settings-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`settings-nav-btn${activeSection === item.id ? ' active' : ''}`}
            >
              <span className="settings-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="settings-content-area">
          {activeSection === 'account' && (
            <>
              <div className="settings-card">
                <h3 className="settings-card-title">👤 Edit Profile</h3>

                <form onSubmit={handleProfileUpdate}>
                  <div className="settings-form-row">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) => handleProfileChange('first_name', e.target.value)}
                        placeholder="Enter your first name"
                        maxLength="150"
                        style={{ ...getFieldBorderStyle('first_name'), borderColor: formErrors.first_name ? '#ff4444' : undefined }}
                      />
                      {formErrors.first_name && <span className="field-error">{formErrors.first_name}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => handleProfileChange('last_name', e.target.value)}
                        placeholder="Enter your last name"
                        maxLength="150"
                        style={{ ...getFieldBorderStyle('last_name'), borderColor: formErrors.last_name ? '#ff4444' : undefined }}
                      />
                      {formErrors.last_name && <span className="field-error">{formErrors.last_name}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        id="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="Enter your email"
                        maxLength="254"
                        style={{ 
                          ...getFieldBorderStyle('email'), 
                          borderColor: formErrors.email ? '#ff4444' : undefined,
                          paddingRight: validationStatus.email.available !== null ? '2.5rem' : undefined
                        }}
                      />
                      {getValidationIcon('email') && (
                        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                          {getValidationIcon('email')}
                        </span>
                      )}
                    </div>
                    {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        id="phone"
                        inputMode="numeric"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        onBlur={handlePhoneBlur}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                        style={{ 
                          ...getFieldBorderStyle('phone'),
                          borderColor: formErrors.phone ? '#ff4444' : undefined,
                          paddingRight: validationStatus.phone.available !== null ? '2.5rem' : undefined
                        }}
                      />
                      {getValidationIcon('phone') && (
                        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                          {getValidationIcon('phone')}
                        </span>
                      )}
                    </div>
                    {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address / Location</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        placeholder="Enter your address"
                        maxLength="500"
                        style={{ flex: 1, ...getFieldBorderStyle('address'), borderColor: formErrors.address ? '#ff4444' : undefined }}
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="btn-sm btn-primary"
                        title="Get current location"
                      >
                        📍
                      </button>
                    </div>
                    {formErrors.address && <span className="field-error">{formErrors.address}</span>}
                  </div>

                  <button
                    type="submit"
                    className="btn-md btn-primary"
                    disabled={loading || !isProfileChanged()}
                    style={{ opacity: isProfileChanged() ? 1 : 0.5, cursor: isProfileChanged() ? 'pointer' : 'not-allowed' }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              <div className="settings-card">
                <h3 className="settings-card-title">🔑 Change Password</h3>

                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className="password-toggle">
                      <input
                        type={passwordVisibility.currentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                      >
                        {passwordVisibility.currentPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-toggle">
                      <input
                        type={passwordVisibility.newPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="New password (min 8 characters)"
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        {passwordVisibility.newPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {passwordForm.newPassword && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {PASSWORD_RULES.map((rule, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '99px',
                              background: rule.test(passwordForm.newPassword) ? 'var(--primary-green, #22c55e)' : '#f1f5f9',
                              color: rule.test(passwordForm.newPassword) ? 'white' : '#64748b',
                              transition: 'background 0.2s',
                            }}
                          >
                            {rule.test(passwordForm.newPassword) ? '✓' : '○'} {rule.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="password-toggle">
                      <input
                        type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {passwordVisibility.confirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-md btn-primary"
                    disabled={loading || !isPasswordChanged()}
                    style={{ opacity: isPasswordChanged() ? 1 : 0.5, cursor: isPasswordChanged() ? 'pointer' : 'not-allowed' }}
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-card">
              <h3 className="settings-card-title">🔔 Notification Preferences</h3>

              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive order updates and promotional emails' },
                { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about order status changes' },
                { key: 'promotionalOffers', label: 'Promotional Offers', description: 'Receive special deals and discounts' },
              ].map((item) => (
                <div key={item.key} className="settings-toggle-row">
                  <div>
                    <h4 style={{ marginBottom: '0.2rem' }}>{item.label}</h4>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{item.description}</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => handleNotificationChange(item.key)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="settings-card">
              <h3 className="settings-card-title">🎨 Theme Preferences</h3>

              <div className="settings-toggle-row">
                <div>
                  <h4 style={{ marginBottom: '0.2rem' }}>Dark Mode</h4>
                  <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Toggle dark/light theme</p>
                </div>
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className={isDarkMode ? 'btn-sm btn-primary' : 'btn-sm btn-secondary'}
                  style={{ width: '100px' }}
                >
                  {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="settings-card">
              <h3 className="settings-card-title">🔒 Privacy & Security</h3>

              <div className="settings-toggle-row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ marginBottom: '0.2rem' }}>Data Handling</h4>
                  <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                    Your data is stored securely. We do not share your personal information with third parties.
                  </p>
                </div>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <h4 style={{ marginBottom: '0.2rem' }}>Clear Local Data</h4>
                  <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Remove all locally stored preferences and cart data</p>
                </div>
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => setShowClearDataModal(true)}
                  style={{ width: '80px' }}
                >
                  Clear
                </button>
              </div>

              <div className="settings-toggle-row" style={{ borderBottom: 'none' }}>
                <div>
                  <h4 style={{ marginBottom: '0.2rem', color: '#ff4444' }}>Delete Account</h4>
                  <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Permanently delete your account and all associated data</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: 'auto',
                    minWidth: 'unset',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal show" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="modal-content">
            <div className="modal-icon">⚠️</div>
            <h2>Are you sure?</h2>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            <p style={{ marginTop: '1rem' }}><strong>Please enter your password to confirm:</strong></p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '0.75rem', margin: '1rem 0', border: '2px solid #ddd', borderRadius: 'var(--border-radius)' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-md btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={handleDeleteAccount}
                className="btn-md btn-danger"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearDataModal && (
        <div className="modal show" onClick={(e) => e.target === e.currentTarget && setShowClearDataModal(false)}>
          <div className="modal-content">
            <div className="modal-icon">🧹</div>
            <h2>Clear All Data?</h2>
            <p>This will remove all your preferences, cart items, and wishlist from the browser.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="btn-md btn-secondary" onClick={() => setShowClearDataModal(false)}>Cancel</button>
              <button className="btn-md btn-primary" onClick={handleClearData}>Yes, Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
