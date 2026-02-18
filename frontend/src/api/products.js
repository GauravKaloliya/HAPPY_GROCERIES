import api from './axios';

export const productsAPI = {
  getAll: (params) => api.get('/api/products/', { params }),
  getById: (id) => api.get(`/api/products/${id}/`),
  getCategories: () => api.get('/api/products/categories/'),
  getByCategory: (category) => api.get(`/api/products/?category=${category}`),
  search: (query) => api.get(`/api/products/?search=${query}`),
  getRelated: (id) => api.get(`/api/products/${id}/related/`),
  getFeatured: () => api.get('/api/products/featured/'),
};
