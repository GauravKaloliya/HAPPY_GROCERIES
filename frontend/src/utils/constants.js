export const API_BASE_URL = 'https://happygroceriesapi.onrender.com';

export const CATEGORIES = [
  { id: 'fruits', name: 'Fruits', emoji: '🍎', color: '#FFB6C1', bgColor: 'bg-pink-100' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥬', color: '#90EE90', bgColor: 'bg-green-100' },
  { id: 'dairy', name: 'Dairy', emoji: '🥛', color: '#87CEEB', bgColor: 'bg-blue-100' },
  { id: 'snacks', name: 'Snacks', emoji: '🍪', color: '#FFE4B5', bgColor: 'bg-yellow-100' },
  { id: 'beverages', name: 'Beverages', emoji: '🧃', color: '#FFDAB9', bgColor: 'bg-orange-100' },
];

export const COUPONS = [
  { code: 'SAVE20', discount: 20, type: 'percentage', minOrder: 50, description: 'Save 20% on orders above $50' },
  { code: 'FRESH15', discount: 15, type: 'percentage', minOrder: 30, description: 'Save 15% on fresh produce' },
  { code: 'WELCOME50', discount: 50, type: 'fixed', minOrder: 100, description: '$50 off on first order above $100' },
  { code: 'DAIRY10', discount: 10, type: 'percentage', category: 'dairy', description: '10% off on dairy products' },
  { code: 'SNACKS25', discount: 25, type: 'percentage', category: 'snacks', description: '25% off on snacks' },
];

export const TAX_RATE = 0.08;
export const DELIVERY_CHARGE = 5.00;
export const FREE_DELIVERY_THRESHOLD = 50.00;

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: '-price', label: 'Price (High to Low)' },
  { value: '-rating', label: 'Highest Rated' },
];
