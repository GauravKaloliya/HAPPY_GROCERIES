import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

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
  const { logCustomActivity } = useActivityLog('page_view', { section: 'login' });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
    setFormErrors({});
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, phone: numericValue });
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
      errors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
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
      // Parse the error to provide user-friendly messages only
      let errorMessage = 'Login failed. Please try again.';
      
      if (err) {
        const errStr = typeof err === 'string' ? err : JSON.stringify(err);
        const errLower = errStr.toLowerCase();
        
        // Check for specific error patterns - only show these 3 types of errors
        if (errLower.includes('not found') || errLower.includes('no user') || errLower.includes('phone')) {
          errorMessage = 'User not found';
        } else if (errLower.includes('invalid') || errLower.includes('incorrect') || errLower.includes('credentials')) {
          errorMessage = 'User credentials are incorrect';
        } else if (errLower.includes('required') || errLower.includes('must be') || errLower.includes('validation')) {
          // Validation errors
          if (typeof err === 'object') {
            if (err.phone) {
              errorMessage = Array.isArray(err.phone) ? err.phone[0] : err.phone;
            } else if (err.password) {
              errorMessage = Array.isArray(err.password) ? err.password[0] : err.password;
            } else if (err.detail) {
              errorMessage = err.detail;
            } else {
              errorMessage = errStr;
            }
          } else {
            errorMessage = err;
          }
        } else if (errLower.includes('not verified') || errLower.includes('verify')) {
          errorMessage = 'Account not verified. Please verify your account first.';
        } else {
          // For any other errors (including HTML), show generic message
          errorMessage = 'Login failed. Please try again.';
        }
      }
      
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
              required
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
