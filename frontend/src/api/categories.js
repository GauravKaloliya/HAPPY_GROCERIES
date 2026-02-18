import api from './axios';

export const categoriesAPI = {
  // Get all categories
  getAll: () => api.get('/api/products/categories/'),
  
  // Get category by ID
  getById: (id) => api.get(`/api/products/categories/${id}/`),
};
