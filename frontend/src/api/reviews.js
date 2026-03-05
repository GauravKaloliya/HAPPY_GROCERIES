import api from './axios';

export const reviewsAPI = {
  // Get reviews for a product
  getProductReviews: (productId) => api.get(`/api/reviews/product/${productId}/`),

  // Get review summary for a product
  getReviewSummary: (productId) => api.get(`/api/reviews/product/${productId}/summary/`),

  // Create a review
  createReview: (productId, data) => api.post(`/api/reviews/product/${productId}/`, data),

  // Update a review
  updateReview: (reviewId, data) => api.patch(`/api/reviews/${reviewId}/`, data),

  // Delete a review
  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}/`),

  // Mark review as helpful
  markHelpful: (reviewId) => api.post(`/api/reviews/${reviewId}/helpful/`),

  // Get user's reviews
  getMyReviews: () => api.get('/api/reviews/my-reviews/'),

  // Get pending reviews (purchased but not reviewed)
  getPendingReviews: () => api.get('/api/reviews/pending/'),
};
