import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, X } from 'lucide-react';
import { register, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import { validatePassword } from '../utils/helpers';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordChecks = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!passwordChecks.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await dispatch(register(registerData)).unwrap();
      toast.success('Welcome to Happy Groceries! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="text-4xl">🛒</span>
            <span className="font-heading font-bold text-2xl gradient-text">
              Happy Groceries
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Create Account 🎉
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Join us for fresh groceries delivered to your door!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400 text-sm"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400 text-sm"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordChecks.hasMinLength ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={passwordChecks.hasMinLength ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordChecks.hasUpperCase ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordChecks.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordChecks.hasLowerCase ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordChecks.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordChecks.hasNumber ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                      One number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400 ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? 'border-green-400'
                        : 'border-red-400'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/about" className="text-pink-500 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/about" className="text-pink-500 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account 🚀'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-pink-500 font-bold hover:text-pink-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
