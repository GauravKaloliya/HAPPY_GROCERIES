import { useState, useEffect } from 'react';
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

  useActivityLog('page_view', { section: 'settings' });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalOffers: false,
  });

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }

    // Load saved preferences
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      setNotifications(JSON.parse(savedPrefs));
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await dispatch(updateProfile(profileForm)).unwrap();
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
    // In a real app, you would verify password and call an API
    toast.error('Account deletion is not available. Please contact support.');
    setShowDeleteModal(false);
  };

  const togglePasswordVisibility = (inputId) => {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="login-required" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
          <h2>Please login to access settings</h2>
          <p>You need to be logged in to manage your settings</p>
          <Link to="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/profile" className="back-link">← Back to Profile</Link>
      <h1 className="section-title">⚙️ Settings</h1>

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div className="settings-sidebar" style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius)', padding: '1.5rem', height: 'fit-content' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'account', label: '👤 Account', icon: '👤' },
              { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
              { id: 'appearance', label: '🎨 Appearance', icon: '🎨' },
              { id: 'privacy', label: '🔒 Privacy & Security', icon: '🔒' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: activeSection === item.id ? 'var(--primary-pink)' : 'transparent',
                  color: activeSection === item.id ? 'white' : 'var(--text-dark)',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="settings-section" style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius)', padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--primary-pink)' }}>
                👤 Account Settings
              </h3>
              
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileForm.phone}
                    disabled
                    style={{ background: 'var(--bg-light)' }}
                  />
                  <small style={{ color: '#666' }}>Phone number cannot be changed</small>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />

              <h4 style={{ marginBottom: '1rem' }}>Change Password</h4>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-toggle">
                    <input
                      type="password"
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
                      👁️
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-toggle">
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => togglePasswordVisibility('newPassword')}
                    >
                      👁️
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-toggle">
                    <input
                      type="password"
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
                      👁️
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="settings-section" style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius)', padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--primary-pink)' }}>
                🔔 Notification Preferences
              </h3>

              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive order updates and promotional emails' },
                { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about order status changes' },
                { key: 'promotionalOffers', label: 'Promotional Offers', description: 'Receive special deals and discounts' },
              ].map((item) => (
                <div key={item.key} className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="setting-label">
                    <h4>{item.label}</h4>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.description}</p>
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

          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <div className="settings-section" style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius)', padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--primary-pink)' }}>
                🎨 Theme Preferences
              </h3>

              <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="setting-label">
                  <h4>Dark Mode</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>Toggle dark/light theme for the website</p>
                </div>
                <button
                  onClick={() => dispatch(toggleTheme())}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: isDarkMode ? 'var(--primary-pink)' : 'var(--bg-light)',
                    color: isDarkMode ? 'white' : 'var(--text-dark)',
                    border: '2px solid var(--primary-pink)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Security */}
          {activeSection === 'privacy' && (
            <div className="settings-section" style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius)', padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--primary-pink)' }}>
                🔒 Privacy & Security
              </h3>

              <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="setting-label">
                  <h4>Data Handling</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Your data is stored securely. We do not share your personal information with third parties.
                  </p>
                </div>
              </div>

              <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="setting-label">
                  <h4>Clear Local Data</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Remove all locally stored preferences and cart data
                  </p>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => setShowClearDataModal(true)}
                >
                  Clear Data
                </button>
              </div>

              <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                <div className="setting-label">
                  <h4>Delete Account</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  className="btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
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
              <button className="btn-danger" onClick={handleDeleteAccount}>Yes, Delete My Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Modal */}
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
