import api from './axios';

export const contactAPI = {
  submitMessage: (data) => api.post('/contact/messages/submit/', data),
  getMessages: (params) => api.get('/contact/messages/', { params }),
};
