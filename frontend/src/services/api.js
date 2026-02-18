import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = refreshResponse.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (phone, password) => api.post('/auth/login/', { phone, password }),
  register: (data) => api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/update/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  getFeatured: () => api.get('/products/featured/'),
  getCategories: () => api.get('/products/categories/'),
  getByCategory: (categoryId) => api.get(`/products/categories/${categoryId}/products/`),
  search: (query, category, sort) => api.get('/products/search/', {
    params: { q: query, category, sort }
  }),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart/'),
  addItem: (productId, quantity = 1) => api.post('/cart/add/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => api.patch(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/delete/`),
  clear: () => api.delete('/cart/clear/'),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/create/', data),
  getStats: () => api.get('/orders/stats/'),
};

// Coupons API
export const couponsAPI = {
  getAll: () => api.get('/coupons/'),
  validate: (code, cartTotal) => api.post('/coupons/validate/', { code, cart_total: cartTotal }),
  getSuggested: (appliedCoupon = '') => api.get('/coupons/suggested/', {
    params: { applied_coupon: appliedCoupon }
  }),
  getRecommendation: () => api.get('/coupons/recommendation/'),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist/'),
  add: (productId) => api.post('/wishlist/add/', { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}/`),
  toggle: (productId) => api.post('/wishlist/toggle/', { product_id: productId }),
  check: (productId) => api.get(`/wishlist/${productId}/check/`),
};
