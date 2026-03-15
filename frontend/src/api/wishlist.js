import api from './axios';

export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: () => api.get('/wishlist/'),

  // Add product to wishlist
  addToWishlist: (productId) => api.post('/wishlist/add/', { product_id: productId }),

  // Remove product from wishlist
  removeFromWishlist: (productId) => api.post('/wishlist/remove/', { product_id: productId }),

  // Check if product is in wishlist
  checkWishlist: (productId) => api.get(`/wishlist/${productId}/check/`),

  // Clear entire wishlist
  clearWishlist: () => api.post('/wishlist/clear/'),
};
