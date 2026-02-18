import api from './axios';

export const ordersAPI = {
  getAll: () => api.get('/api/orders/'),
  getById: (id) => api.get(`/api/orders/${id}/`),
  create: (data) => api.post('/api/orders/', data),
};
