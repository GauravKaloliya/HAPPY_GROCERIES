import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser, selectIsAuthenticated, updateProfile, changePassword } from '../store/slices/authSlice';
import { toggleTheme, selectIsDarkMode } from '../store/slices/themeSlice';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isDarkMode = useSelector(selectIsDarkMode);

  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useActivityLog('page_view', { section: 'settings' });

  const initialProfileRef = useRef({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
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
      profileForm.email !== initial.email
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

  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(profileForm.email)) {
      errors.email = 'Enter a valid email address';
    }
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setProfileForm((prev) => ({ ...prev, address: addr }));
          toast.success('Location fetched! ✅');
        } catch {
          toast.error('Failed to fetch location details');
        } finally {
          setFetchingLocation(false);
        }
      },
      () => {
        toast.error('Unable to retrieve your location');
        setFetchingLocation(false);
      }
    );
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    setProfileErrors({});
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

    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});

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
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        placeholder="Enter your first name"
                        style={getFieldBorderStyle('first_name')}
                      />
                      {profileErrors.first_name && (
                        <div className="error-message show">{profileErrors.first_name}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        placeholder="Enter your last name"
                        style={getFieldBorderStyle('last_name')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Enter your email"
                      style={getFieldBorderStyle('email')}
                    />
                    {profileErrors.email && (
                      <div className="error-message show">{profileErrors.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      id="phone"
                      value={profileForm.phone}
                      disabled
                      style={{ background: 'var(--bg-light)', opacity: 0.7 }}
                    />
                    <small style={{ color: '#888', marginTop: '0.25rem', display: 'block' }}>Phone number cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <input
                        type="text"
                        id="address"
                        value={profileForm.address || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Enter your address"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleFetchLocation}
                        disabled={fetchingLocation}
                        className="btn-secondary"
                        style={{ whiteSpace: 'nowrap', minWidth: 'unset', padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
                        title="Use my current location"
                      >
                        {fetchingLocation ? '⌛' : '📍'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
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
                    {passwordErrors.currentPassword && (
                      <div className="error-message show">{passwordErrors.currentPassword}</div>
                    )}
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
                    {passwordErrors.newPassword && (
                      <div className="error-message show">{passwordErrors.newPassword}</div>
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
                    {passwordErrors.confirmPassword && (
                      <div className="error-message show">{passwordErrors.confirmPassword}</div>
                    )}
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
