import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Welcome Back! 👋</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message show" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In 🚀'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <p className="auth-link" style={{ marginTop: '0.5rem' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
