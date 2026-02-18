import api from './axios';

export const contactAPI = {
  submitMessage: (data) => api.post('/api/contact/messages/submit/', data),
  getMessages: (params) => api.get('/api/contact/messages/', { params }),
};
