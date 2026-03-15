import api from './axios';

export const configAPI = {
  getAllConfig: () => api.get('/config/all/'),
  getSettings: () => api.get('/config/settings/'),
  getSortOptions: () => api.get('/config/sort-options/'),
};
