import api from './axios';

export const authAPI = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  logout: () => api.post('/api/auth/logout/'),
  refresh: (refreshToken) => api.post('/api/auth/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  checkPhoneExists: (phone) => api.post('/api/auth/check-phone/', { phone }),
  checkEmailExists: (email) => api.post('/api/auth/check-email/', { email }),
};
