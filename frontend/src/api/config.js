import api from './axios';

export const configAPI = {
  getAllConfig: () => api.get('/api/config/all/'),
  getSettings: () => api.get('/api/config/settings/'),
  getSortOptions: () => api.get('/api/config/sort-options/'),
};
