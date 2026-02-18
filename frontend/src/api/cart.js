import api from './axios';

export const cartAPI = {
  getCart: () => api.get('/api/cart/'),
  addItem: (productId, quantity = 1) => api.post('/api/cart/add/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => api.post('/api/cart/update_item/', { item_id: itemId, quantity }),
  removeItem: (itemId) => api.post('/api/cart/remove_item/', { item_id: itemId }),
  clearCart: () => api.post('/api/cart/clear/'),
};
