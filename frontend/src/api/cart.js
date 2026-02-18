import api from './axios';

export const cartAPI = {
  getCart: () => api.get('/api/cart/'),
  addItem: (productId, quantity = 1) => api.post('/api/cart/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => api.patch(`/api/cart/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/api/cart/${itemId}/`),
  clearCart: () => api.delete('/api/cart/clear/'),
};
