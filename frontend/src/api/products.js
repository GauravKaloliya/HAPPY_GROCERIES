import api from './axios';

export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  getCategories: () => api.get('/products/categories/'),
  getByCategory: (category) => api.get(`/products/?category=${category}`),
  search: (query) => api.get(`/products/?search=${query}`),
  getRelated: (id) => api.get(`/products/${id}/related/`),
  getFeatured: () => api.get('/products/featured/'),
};
