import { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api/auth';
import { isAdminAuthenticated, setAdminSession } from '../utils/adminAuth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.adminLogin(formData);
      setAdminSession(response.data);
      toast.success('Admin access granted');
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-screen">
      <div className="admin-auth-card">
        <div className="admin-auth-icon">
          <span role="img" aria-label="cart">🛒</span>
        </div>
        <h1>Admin Access</h1>
        <p>Use the protected admin credentials to manage products securely.</p>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="admin"
            autoComplete="username"
          />

          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-field">
            <LockKeyhole size={16} />
            <input
              id="admin-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="admin"
              autoComplete="current-password"
            />
          </div>

          {error ? <div className="admin-form-error">{error}</div> : null}

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
