import api from './axios';

export const categoriesAPI = {
  // Get all categories
  getAll: () => api.get('/products/categories/'),
  
  // Get category by ID
  getById: (id) => api.get(`/products/categories/${id}/`),
};
