import api from './axios';

export const reviewsAPI = {
  // Get reviews for a product
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}/`),
  
  // Get review summary for a product
  getReviewSummary: (productId) => api.get(`/reviews/product/${productId}/summary/`),
  
  // Create a review
  createReview: (productId, data) => api.post(`/reviews/product/${productId}/`, data),
  
  // Update a review
  updateReview: (reviewId, data) => api.patch(`/reviews/${reviewId}/`, data),
  
  // Delete a review
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}/`),
  
  // Mark review as helpful
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful/`),
  
  // Get user's reviews
  getMyReviews: () => api.get('/reviews/my-reviews/'),
  
  // Get pending reviews (purchased but not reviewed)
  getPendingReviews: () => api.get('/reviews/pending/'),
};
