import { useState, useEffect } from 'react';
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
  const [formErrors, setFormErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
    setFormErrors({});
  }, [dispatch, location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue.slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    if (error) dispatch(clearError());
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.phone) {
      errors.phone = '📱 Phone number is required';
    } else if (formData.phone.length !== 10) {
      errors.phone = '📱 Phone number must be 10 digits';
    } else if (!/^[6-9]/.test(formData.phone)) {
      errors.phone = '📱 Please enter a valid Indian phone number (starts with 6, 7, 8, or 9)';
    }
    
    if (!formData.password) {
      errors.password = '🔒 Password is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err?.phone?.[0] || err?.non_field_errors?.[0] || '❌ Invalid phone number or password. Please try again.';
      setFormErrors({ submit: errorMessage });
    }
  };

  const handleSignupClick = () => {
    dispatch(clearError());
    setFormErrors({});
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Welcome Back! 👋</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number (India)</label>
            <div className="phone-input-wrapper">
              <span className="country-code">+91</span>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                required
              />
            </div>
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
            {formErrors.password && (
              <div className="error-message show">{formErrors.password}</div>
            )}
          </div>

          {(error || formErrors.submit) && (
            <div className="error-message show" style={{ marginBottom: '1rem' }}>
              {error || formErrors.submit}
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
          Don't have an account? <Link to="/signup" onClick={handleSignupClick}>Sign up</Link>
        </p>

        <p className="auth-link" style={{ marginTop: '0.5rem' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
