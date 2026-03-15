import api from './axios';

export const couponsAPI = {
  // Get all available coupons
  getAll: (params) => api.get('/coupons/', { params }),

  // Validate a coupon code
  validate: (code, cartTotal, cartItems) => api.post('/coupons/validate/', {
    code,
    cart_total: cartTotal,
    cart_items: cartItems
  }),

  // Apply coupon to cart
  apply: (code) => api.post('/coupons/apply/', { code }),

  // Remove applied coupon
  remove: () => api.post('/coupons/remove/'),

  // Get suggested coupons based on cart
  getSuggested: (cartTotal, cartItems) => api.post('/coupons/suggested/', {
    cart_total: cartTotal,
    cart_items: cartItems
  }),
};
