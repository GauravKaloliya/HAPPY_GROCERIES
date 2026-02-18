import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      toast.success('Welcome to Happy Groceries! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
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
            {formData.password && (
              <div className="password-strength">
                <div className={`password-strength-bar ${passwordStrength}`}></div>
              </div>
            )}
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
            {loading ? 'Creating Account...' : 'Sign Up 🚀'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <p className="auth-link" style={{ marginTop: '0.5rem' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
