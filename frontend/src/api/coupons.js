import api from './axios';

export const couponsAPI = {
  validate: (code) => api.get(`/api/coupons/?code=${code}`),
  apply: (code, orderData) => api.post('/api/coupons/apply/', { code, ...orderData }),
};
