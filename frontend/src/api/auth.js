import api from './axios';

export const authAPI = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  logout: () => api.post('/api/auth/logout/'),
  refresh: (refreshToken) => api.post('/api/auth/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  getStats: () => api.get('/api/auth/stats/'),
  checkUsername: (username) => api.get(`/api/auth/check-username/?username=${encodeURIComponent(username)}`),
  checkEmail: (email) => api.get(`/api/auth/check-email/?email=${encodeURIComponent(email)}`),
  checkPhone: (phone) => api.get(`/api/auth/check-phone/?phone=${encodeURIComponent(phone)}`),
};
