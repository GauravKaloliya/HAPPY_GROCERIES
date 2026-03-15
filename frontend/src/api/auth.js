import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getStats: () => api.get('/auth/stats/'),
  checkUsername: (username) => api.get(`/auth/check-username/?username=${encodeURIComponent(username)}`),
  checkEmail: (email) => api.get(`/auth/check-email/?email=${encodeURIComponent(email)}`),
  checkPhone: (phone) => api.get(`/auth/check-phone/?phone=${encodeURIComponent(phone)}`),
};
