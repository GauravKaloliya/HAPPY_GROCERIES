import axios from './axios';

export const activityLogAPI = {
  // Get all activity logs for current user
  getLogs: async () => {
    const response = await axios.get('/users/activity-logs/');
    return response;
  },

  // Create a new activity log entry
  createLog: async (data) => {
    const response = await axios.post('/users/activity-logs/create/', data);
    return response;
  },

  // Get activity statistics
  getStats: async () => {
    const response = await axios.get('/users/activity-logs/stats/');
    return response;
  },
};

// Activity type constants for frontend use
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  ORDER_PLACED: 'order_placed',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_DELIVERED: 'order_delivered',
  CART_ADD: 'cart_add',
  CART_REMOVE: 'cart_remove',
  WISHLIST_ADD: 'wishlist_add',
  WISHLIST_REMOVE: 'wishlist_remove',
  COUPON_APPLY: 'coupon_apply',
  COUPON_REMOVE: 'coupon_remove',
  PROFILE_VIEW: 'profile_view',
  SETTINGS_UPDATE: 'settings_update',
  SEARCH: 'search',
  PRODUCT_VIEW: 'product_view',
  CATEGORY_VIEW: 'category_view',
  CHECKOUT: 'checkout',
  PAYMENT: 'payment',
  ADDRESS_ADD: 'address_add',
  ADDRESS_UPDATE: 'address_update',
  ADDRESS_DELETE: 'address_delete',
  CONTACT_SUBMIT: 'contact_submit',
  EMAIL_VERIFICATION: 'email_verification',
  PHONE_VERIFICATION: 'phone_verification',
};

// Helper function to log activity
export const logActivity = async (activityType, description = '', metadata = {}) => {
  try {
    await activityLogAPI.createLog({
      activity_type: activityType,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
