import api from './axios';

export const brandsAPI = {
  getAll: () => api.get('/brands/'),
  getById: (id) => api.get(`/brands/${id}/`),
};
