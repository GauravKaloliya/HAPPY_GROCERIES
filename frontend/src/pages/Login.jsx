import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const { logCustomActivity } = useActivityLog('page_view', { section: 'login' });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
    setFormErrors({});
    setSubmitError('');
  }, [dispatch]);

  const handleChange = (e) => {
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
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    return errors;
  };

  const parseErrorMessage = (err) => {
    if (!err) return 'Invalid phone number or password.';

    if (typeof err === 'string') {
      const lower = err.toLowerCase();
      if (lower.includes('not registered') || lower.includes('not found')) {
        return 'Invalid phone number or password.';
      }
      if (lower.includes('locked') || lower.includes('banned')) {
        return 'Your account has been temporarily locked. Please try again later.';
      }
      if (lower.includes('server') || lower.includes('500')) {
        return 'Server error. Please try again later.';
      }
      if (lower.includes('network') || lower.includes('connection')) {
        return 'Network error. Please check your connection.';
      }
      return 'Invalid phone number or password.';
    }

    if (typeof err === 'object') {
      if (err.error) {
        const lower = err.error.toLowerCase();
        if (lower.includes('not registered') || lower.includes('not found') || lower.includes('incorrect') || lower.includes('invalid') || lower.includes('password')) {
          return 'Invalid phone number or password.';
        }
        if (lower.includes('locked')) {
          return 'Your account has been temporarily locked. Please try again later.';
        }
        return 'Invalid phone number or password.';
      }
      if (err.detail) {
        return 'Invalid phone number or password.';
      }
      if (err.non_field_errors) {
        return 'Invalid phone number or password.';
      }
    }

    return 'Invalid phone number or password.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitError('');
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Welcome back! 🎉');
      logCustomActivity('login_success', { phone: formData.phone });
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = parseErrorMessage(err);
      setSubmitError(errorMessage);
    }
  };

  const handleSignupClick = () => {
    dispatch(clearError());
    setFormErrors({});
    setSubmitError('');
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Welcome Back! 👋</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="text"
              inputMode="numeric"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              autoComplete="tel"
            />
            {formErrors.phone && (
              <div className="error-message show">{formErrors.phone}</div>
            )}
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
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formErrors.password && (
              <div className="error-message show">{formErrors.password}</div>
            )}
          </div>

          {submitError && (
            <div className="error-message show" style={{ marginBottom: '1rem' }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="btn-md btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In 🚀'}
          </button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/signup" onClick={handleSignupClick}>Sign up</Link>
        </p>

        <p className="auth-link" style={{ marginTop: '0.5rem' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
