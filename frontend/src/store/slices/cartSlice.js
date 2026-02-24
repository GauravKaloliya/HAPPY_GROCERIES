import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cart';
import { couponsAPI } from '../../api/coupons';
import { productsAPI } from '../../api/products';
import { logout } from './authSlice';

const GUEST_CART_KEY = 'guestCart';

const getGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const getInitialItems = () => {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken ? [] : getGuestCart();
};

const initialState = {
  items: getInitialItems(),
  loading: false,
  error: null,
  coupon: null,
  appliedCoupon: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        return getGuestCart();
      }

      const response = await cartAPI.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, product }, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        const items = getGuestCart();
        const existingItemIndex = items.findIndex(item => item.id === productId || item.product?.id === productId);
        let productData = product || (existingItemIndex >= 0 ? items[existingItemIndex].product : null);

        if (!productData) {
          const response = await productsAPI.getById(productId);
          productData = response.data;
        }

        const maxQuantity = productData?.stock ? Math.min(productData.stock, 99) : 99;

        if (existingItemIndex >= 0) {
          // Update existing item immutably
          items[existingItemIndex] = {
            ...items[existingItemIndex],
            quantity: Math.min(items[existingItemIndex].quantity + quantity, maxQuantity)
          };
        } else {
          items.push({
            id: productData.id,
            product: productData,
            quantity: Math.min(quantity, maxQuantity),
          });
        }

        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.addItem(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        const items = getGuestCart();
        const itemIndex = items.findIndex(item => item.id === itemId || item.product?.id === itemId);
        if (itemIndex === -1) {
          return rejectWithValue('Cart item not found');
        }

        if (quantity <= 0) {
          items.splice(itemIndex, 1);
        } else {
          const item = items[itemIndex];
          const maxQuantity = item.product?.stock ? Math.min(item.product.stock, 99) : 99;
          // Update immutably
          items[itemIndex] = {
            ...item,
            quantity: Math.min(quantity, maxQuantity)
          };
        }

        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.updateItem(itemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        const items = getGuestCart().filter(item => item.id !== itemId && item.product?.id !== itemId);
        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.removeItem(itemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        saveGuestCart([]);
        return { items: [] };
      }

      const response = await cartAPI.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'cart/validateCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await couponsAPI.validate(code, cartTotal);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    clearCoupon: (state) => {
      state.coupon = null;
      state.appliedCoupon = null;
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    clearCartState: (state) => {
      state.items = [];
      state.coupon = null;
      state.appliedCoupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.items) {
          state.items = action.payload.items;
        } else {
          const existingItem = state.items.find(item => item.id === action.payload.id);
          if (existingItem) {
            existingItem.quantity = action.payload.quantity;
          } else {
            state.items.push(action.payload);
          }
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload.items) {
          state.items = action.payload.items;
          return;
        }
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload?.items) {
          state.items = action.payload.items;
          return;
        }
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.coupon = null;
        state.appliedCoupon = null;
      })
      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.valid) {
          state.appliedCoupon = action.payload.coupon;
        }
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.items = getGuestCart();
        state.coupon = null;
        state.appliedCoupon = null;
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items || [];
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartCount = (state) =>
  (state.cart.items || []).reduce((total, item) => total + (item.quantity || 0), 0);
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;

export const selectCartSubtotal = (state) => {
  const items = state.cart?.items || [];
  return items.reduce((total, item) => {
    const itemPrice = parseFloat(item?.product?.price || item?.price || 0) || 0;
    const quantity = item?.quantity || 0;
    return total + itemPrice * quantity;
  }, 0);
};

export const selectAppliedDiscountAmount = (state) => {
  const items = state.cart?.items || [];
  return items.reduce((total, item) => {
    const product = item?.product || {};
    const price = parseFloat(product?.price || item?.price || 0) || 0;
    const mrp = parseFloat(product?.mrp || price) || 0;
    const discountAmount = mrp > price ? (mrp - price) * (item?.quantity || 0) : 0;
    return total + discountAmount;
  }, 0);
};

export const selectCartTax = (state) => {
  const taxRate = state.config?.settings?.tax_rate || 0;
  const subtotal = selectCartSubtotal(state);
  return isNaN(subtotal) ? 0 : subtotal * taxRate;
};

export const selectDeliveryCharge = (state) => {
  const subtotal = selectCartSubtotal(state);
  if (isNaN(subtotal)) return 40;
  const freeThreshold = state.config?.settings?.free_delivery_threshold || 500;
  const standardCharge = state.config?.settings?.standard_delivery_charge || 40;
  return subtotal >= freeThreshold ? 0 : standardCharge;
};

export const selectDiscount = (state) => {
  const subtotal = selectCartSubtotal(state);
  if (isNaN(subtotal)) return 0;
  const coupon = state.cart.appliedCoupon;

  if (!coupon) return 0;

  if (coupon.coupon_type === 'percentage') {
    const value = parseFloat(coupon.value) || 0;
    return subtotal * (value / 100);
  } else if (coupon.coupon_type === 'fixed') {
    const value = parseFloat(coupon.value) || 0;
    return Math.min(value, subtotal);
  }

  return parseFloat(coupon.discount_amount || coupon.potential_discount || 0) || 0;
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state) || 0;
  const tax = selectCartTax(state) || 0;
  const delivery = selectDeliveryCharge(state) || 0;
  const discount = selectDiscount(state) || 0;

  const total = Number(subtotal) + Number(tax) + Number(delivery) - Number(discount);
  return Math.max(0, isNaN(total) ? 0 : total);
};

export const { setCoupon, clearCoupon, applyCoupon, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
