import api from './axios';

export const cartAPI = {
  getCart: () => api.get('/cart/'),
  addItem: (productId, quantity = 1, variantId = null) =>
    api.post('/cart/add/', { product_id: productId, quantity, variant_id: variantId }),
  updateItem: (itemId, quantity, variantId = null) =>
    api.post('/cart/update_item/', { item_id: itemId, quantity, variant_id: variantId }),
  removeItem: (itemId) => api.post('/cart/remove_item/', { item_id: itemId }),
  clearCart: () => api.post('/cart/clear/'),
};
