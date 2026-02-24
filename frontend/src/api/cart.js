import api from './axios';

export const cartAPI = {
  getCart: () => api.get('/cart/'),
  addItem: (productId, quantity = 1) => api.post('/cart/add/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => api.post('/cart/update_item/', { item_id: itemId, quantity }),
  removeItem: (itemId) => api.post('/cart/remove_item/', { item_id: itemId }),
  clearCart: () => api.post('/cart/clear/'),
};
