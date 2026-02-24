import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  checkUsername: (phone) => api.post('/auth/check-username/', { phone }),
  checkEmail: (email) => api.post('/auth/check-email/', { email }),
  checkPassword: (password) => api.post('/auth/check-password/', { password }),
};
