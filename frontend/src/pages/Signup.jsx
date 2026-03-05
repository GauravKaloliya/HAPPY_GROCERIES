import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuthLoading, clearError } from '../store/slices/authSlice';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import useActivityLog from '../hooks/useActivityLog';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /\d/.test(p), label: 'One number' },
];

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [validationStatus, setValidationStatus] = useState({
    phone: { checking: false, available: null },
    email: { checking: false, available: null },
  });
  const { logCustomActivity } = useActivityLog('page_view', { section: 'signup' });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const passwordStrength = (() => {
    const passed = PASSWORD_RULES.filter((r) => r.test(formData.password)).length;
    if (passed <= 1) return 'weak';
    if (passed <= 2) return 'medium';
    if (passed === 3) return 'medium';
    return 'strong';
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: numeric });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    if (submitError) setSubmitError('');
    if (name === 'phone' || name === 'email') {
      setValidationStatus(prev => ({
        ...prev,
        [name]: { checking: false, available: null }
      }));
    }
  };

  const handlePhoneBlur = async () => {
    const phone = formData.phone;
    if (!phone || !/^\d{10}$/.test(phone)) return;

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

  const handleEmailBlur = async () => {
    const email = formData.email;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;

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

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters, spaces, hyphens and apostrophes';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const parseErrorMessage = (err) => {
    if (!err) return 'Registration failed. Please try again.';

    if (typeof err === 'string') {
      const lower = err.toLowerCase();
      if (lower.includes('phone') && lower.includes('exist')) {
        return 'An account with this phone number already exists.';
      }
      if (lower.includes('email') && lower.includes('exist')) {
        return 'An account with this email already exists.';
      }
      if (lower.includes('phone') && (lower.includes('invalid') || lower.includes('format'))) {
        return 'Invalid phone number format.';
      }
      if (lower.includes('server') || lower.includes('500')) {
        return 'Server error. Please try again later.';
      }
      return 'Registration failed. Please try again.';
    }

    if (typeof err === 'object') {
      if (err.phone) {
        const msg = Array.isArray(err.phone) ? err.phone[0] : err.phone;
        if (msg.toLowerCase().includes('exist')) return 'An account with this phone number already exists.';
        return 'Invalid phone number.';
      }
      if (err.email) {
        const msg = Array.isArray(err.email) ? err.email[0] : err.email;
        if (msg.toLowerCase().includes('exist')) return 'An account with this email already exists.';
        return 'Invalid email address.';
      }
      if (err.detail) return 'Registration failed. Please try again.';
      if (err.non_field_errors) {
        return Array.isArray(err.non_field_errors) ? err.non_field_errors[0] : err.non_field_errors;
      }
    }

    return 'Registration failed. Please try again.';
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
      logCustomActivity('register_success', { phone: formData.phone });
      navigate('/');
    } catch (err) {
      const errorMessage = parseErrorMessage(err);
      setSubmitError(errorMessage);
    }
  };

  const handleLoginClick = () => {
    dispatch(clearError());
    setFormErrors({});
    setSubmitError('');
  };

  const getValidationIcon = (field) => {
    const status = validationStatus[field];
    if (status.checking) return '⏳';
    if (status.available === true) return '✅';
    if (status.available === false) return '❌';
    return null;
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1 className="auth-title">Create Account 🎉</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {formErrors.name && (
              <div className="error-message show">{formErrors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div>
              <input
                type="text"
                inputMode="numeric"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
                autoComplete="tel"

              />
              {getValidationIcon('phone') && (
                <span>
                  {getValidationIcon('phone')}
                </span>
              )}
            </div>
            {formErrors.phone && (
              <div className="error-message show">{formErrors.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email <span>(optional)</span></label>
            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                placeholder="Enter your email"
                autoComplete="email"

              />
              {getValidationIcon('email') && (
                <span>
                  {getValidationIcon('email')}
                </span>
              )}
            </div>
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
                placeholder="Create a strong password"
                autoComplete="new-password"
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
            {formData.password && (
              <>
                <div className="password-strength">
                  <div className={`password-strength-bar ${passwordStrength}`}></div>
                </div>
                <div>
                  {PASSWORD_RULES.map((rule, i) => (
                    <span
                      key={i}

                    >
                      {rule.test(formData.password) ? '✓' : '○'} {rule.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-toggle">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <div className="error-message show">{formErrors.confirmPassword}</div>
            )}
          </div>

          {submitError && (
            <div className="error-message show">
              {submitError}
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

        <p className="auth-link">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
