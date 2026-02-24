import api from './axios';

export const brandsAPI = {
  getAll: () => api.get('/api/brands/'),
  getById: (id) => api.get(`/api/brands/${id}/`),
};
