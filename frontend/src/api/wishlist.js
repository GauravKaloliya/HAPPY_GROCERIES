import api from './axios';

export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: () => api.get('/api/wishlist/'),

  // Add product to wishlist
  addToWishlist: (productId) => api.post('/api/wishlist/add/', { product_id: productId }),

  // Remove product from wishlist
  removeFromWishlist: (productId) => api.post('/api/wishlist/remove/', { product_id: productId }),

  // Check if product is in wishlist
  checkWishlist: (productId) => api.get(`/api/wishlist/${productId}/check/`),

  // Clear entire wishlist
  clearWishlist: () => api.post('/api/wishlist/clear/'),
};
