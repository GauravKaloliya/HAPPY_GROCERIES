import api from './axios';

export const combosAPI = {
  // Get all combos
  getAll: () => api.get('/products/combos/'),
  
  // Get combo by ID
  getById: (id) => api.get(`/products/combos/${id}/`),
};
