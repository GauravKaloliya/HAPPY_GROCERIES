import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const { logCustomActivity } = useActivityLog('page_view', { section: 'signup' });

  useEffect(() => {
    dispatch(clearError());
    setFormErrors({});
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
    if (error) dispatch(clearError());
    
    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 10) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
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
      const nameParts = formData.name.trim().split(' ').filter(Boolean);
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ');

      const payload = {
        phone: formData.phone,
        email: formData.email,
        first_name: firstName,
        last_name: lastName,
        password: formData.password,
        password_confirm: formData.password,
      };

      await dispatch(register(payload)).unwrap();
      toast.success('Welcome to Happy Groceries! 🎉');
      navigate('/');
    } catch (err) {
      const errorMessage = err || 'Registration failed. Please try again.';
      setFormErrors({ submit: errorMessage });
    }
  };

  const handleLoginClick = () => {
    dispatch(clearError());
    setFormErrors({});
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Create Account 🎉</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            {formErrors.name && (
              <div className="error-message show">{formErrors.name}</div>
            )}
          </div>

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
            {formErrors.phone && (
              <div className="error-message show">{formErrors.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <div className="error-message show">{formErrors.email}</div>
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
                placeholder="Create a password"
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
            {formData.password && (
              <div className="password-strength">
                <div className={`password-strength-bar ${passwordStrength}`}></div>
              </div>
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
            {loading ? 'Creating Account...' : 'Sign Up 🚀'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login" onClick={handleLoginClick}>Login</Link>
        </p>

        <p className="auth-link" style={{ marginTop: '0.5rem' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
