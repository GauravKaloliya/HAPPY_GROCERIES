/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '₹0';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `₹${numPrice.toFixed(2)}`;
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format phone number with spacing
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
};

/**
 * Calculate discounted price
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discounted price
 */
export const calculateDiscountedPrice = (price, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return price;
  return price * (1 - discountPercent / 100);
};

/**
 * Render star rating
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star string
 */
export const renderStars = (rating) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 >= 0.5;
  return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
};

/**
 * Get category color
 * @param {string} category - Category name
 * @returns {string} CSS color variable
 */
export const getCategoryColor = (category) => {
  const colors = {
    'Fruits': 'var(--primary-pink)',
    'Vegetables': 'var(--primary-green)',
    'Dairy': 'var(--primary-blue)',
    'Snacks': 'var(--primary-yellow)',
    'Beverages': 'var(--primary-orange)',
  };
  return colors[category] || 'var(--primary-blue)';
};

/**
 * Get category emoji
 * @param {string} category - Category name
 * @returns {string} Emoji
 */
export const getCategoryEmoji = (category) => {
  const emojis = {
    'Fruits': '🍎',
    'Vegetables': '🥕',
    'Dairy': '🥛',
    'Snacks': '🍪',
    'Beverages': '🧃',
  };
  return emojis[category] || '📦';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Max length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
