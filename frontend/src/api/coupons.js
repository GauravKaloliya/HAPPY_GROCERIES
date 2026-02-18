import api from './axios';

export const couponsAPI = {
  // Get all available coupons
  getAll: () => api.get('/api/coupons/'),
  
  // Validate a coupon code
  validate: (code, cartTotal, cartItems) => api.post('/api/coupons/validate/', { 
    code, 
    cart_total: cartTotal,
    cart_items: cartItems 
  }),
  
  // Apply coupon to cart
  apply: (code) => api.post('/api/coupons/apply/', { code }),
  
  // Remove applied coupon
  remove: () => api.post('/api/coupons/remove/'),
  
  // Get suggested coupons based on cart
  getSuggested: (cartTotal, cartItems) => api.post('/api/coupons/suggested/', {
    cart_total: cartTotal,
    cart_items: cartItems
  }),
};
