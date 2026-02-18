import api from './axios';

export const contactAPI = {
  submitMessage: (data) => api.post('/contact/submit/', data),
  getMessages: (params) => api.get('/contact/messages/', { params }),
};
