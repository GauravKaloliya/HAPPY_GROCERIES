import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser, selectIsAuthenticated, updateProfile, changePassword } from '../store/slices/authSlice';
import { toggleTheme, selectIsDarkMode } from '../store/slices/themeSlice';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

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
  const [phoneError, setPhoneError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

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
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

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
      profileForm.phone !== initial.phone ||
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

  const handleEmailBlur = async () => {
    const email = profileForm.email;
    if (!email || email === (user?.email || '')) return;

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

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Only allow numbers
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length > 10) {
        setPhoneError('Phone number must be exactly 10 digits');
      } else {
        setPhoneError('');
      }
      setProfileForm({ ...profileForm, [name]: numbersOnly });
    } else {
      setProfileForm({ ...profileForm, [name]: value });
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
            setProfileForm({ ...profileForm, address: data.display_name });
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

  const handlePasswordBlur = async () => {
    const password = passwordForm.newPassword;
    if (!password || password.length < 6) return;

    setCheckingPassword(true);
    try {
      const response = await authAPI.checkPassword(password);
      const { valid, message } = response.data;
      setPasswordStatus(valid ? { valid: true, message } : { valid: false, message });
    } catch {
      // Silent fail
    } finally {
      setCheckingPassword(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validate phone number
    if (profileForm.phone && profileForm.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    // Validate email format if provided
    if (profileForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileForm.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setLoading(true);

    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      initialProfileRef.current = { ...profileForm };
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
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

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
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
          <Link to="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Login</Link>
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
                        name="first_name"
                        value={profileForm.first_name}
                        onChange={handleProfileInputChange}
                        placeholder="Enter your first name"
                        style={getFieldBorderStyle('first_name')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name (Optional)</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={profileForm.last_name}
                        onChange={handleProfileInputChange}
                        placeholder="Enter your last name"
                        style={getFieldBorderStyle('last_name')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address (Optional)</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileInputChange}
                      onBlur={handleEmailBlur}
                      placeholder="Enter your email"
                      style={getFieldBorderStyle('email')}
                    />
                    {checkingEmail && <small style={{ color: '#888' }}>Checking...</small>}
                    {emailStatus && !emailStatus.available && (
                      <small style={{ color: '#ef4444', display: 'block' }}>{emailStatus.message}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileInputChange}
                      placeholder="10-digit phone number"
                      maxLength={10}
                      style={getFieldBorderStyle('phone')}
                    />
                    {phoneError && <small style={{ color: '#ef4444', display: 'block' }}>{phoneError}</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address (Optional)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileInputChange}
                        placeholder="Enter your address"
                        style={{ ...getFieldBorderStyle('address'), flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="btn-secondary"
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          minWidth: '130px',
                          opacity: locationLoading ? 0.7 : 1,
                          cursor: locationLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {locationLoading ? '📍...' : '📍 Get Location'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !isProfileChanged() || phoneError}
                    style={{ opacity: (isProfileChanged() && !phoneError) ? 1 : 0.5, cursor: (isProfileChanged() && !phoneError) ? 'pointer' : 'not-allowed' }}
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
                        onBlur={handlePasswordBlur}
                        placeholder="New password (min 6 characters)"
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        {passwordVisibility.newPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {checkingPassword && <small style={{ color: '#888' }}>Checking...</small>}
                    {passwordStatus && !passwordStatus.valid && (
                      <small style={{ color: '#ef4444', display: 'block' }}>{passwordStatus.message}</small>
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
                    className="btn-primary"
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
                  className={isDarkMode ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100px', minWidth: 'unset', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
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
                  className="btn-secondary" 
                  onClick={() => setShowClearDataModal(true)}
                  style={{ width: '80px', minWidth: 'unset', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
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
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={handleDeleteAccount}
                style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--border-radius)', fontWeight: 600, cursor: 'pointer' }}
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
              <button className="btn-secondary" onClick={() => setShowClearDataModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleClearData}>Yes, Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
