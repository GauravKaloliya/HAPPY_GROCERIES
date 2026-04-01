import api from './axios';

export const cartAPI = {
  getCart: () => api.get('/cart/'),
  addItem: (productId, quantity = 1, variantId = null) => {
    const payload = { product_id: productId, quantity };
    if (variantId !== null && variantId !== undefined) {
      payload.variant_id = variantId;
    }
    return api.post('/cart/add/', payload);
  },
  updateItem: (itemId, quantity, variantId = null) => {
    const payload = { item_id: itemId, quantity };
    if (variantId !== null && variantId !== undefined) {
      payload.variant_id = variantId;
    }
    return api.post('/cart/update_item/', payload);
  },
  removeItem: (itemId) => api.post('/cart/remove_item/', { item_id: itemId }),
  clearCart: () => api.post('/cart/clear/'),
};
