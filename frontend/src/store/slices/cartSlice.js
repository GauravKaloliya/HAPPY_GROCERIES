import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cart';
import { couponsAPI } from '../../api/coupons';
import { productsAPI } from '../../api/products';
import { TAX_RATE, DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../../utils/constants';

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
        const existingItem = items.find(item => item.id === productId || item.product?.id === productId);
        let productData = product || existingItem?.product;

        if (!productData) {
          const response = await productsAPI.getById(productId);
          productData = response.data;
        }

        const maxQuantity = productData?.stock ? Math.min(productData.stock, 99) : 99;

        if (existingItem) {
          existingItem.quantity = Math.min(existingItem.quantity + quantity, maxQuantity);
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
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
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
          item.quantity = Math.min(quantity, maxQuantity);
        }

        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.updateItem(itemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
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

      await cartAPI.removeItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
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
        return [];
      }

      await cartAPI.clearCart();
      return [];
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
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
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
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => {
    const regularPrice = parseFloat(item.product?.price || item.price || 0);
    const effectivePrice = parseFloat(item.product?.effective_price || regularPrice);
    const itemPrice = effectivePrice < regularPrice ? effectivePrice : regularPrice;
    return total + itemPrice * item.quantity;
  }, 0);

export const selectCartTax = (state) => selectCartSubtotal(state) * TAX_RATE;

export const selectDeliveryCharge = (state) => {
  const subtotal = selectCartSubtotal(state);
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
};

export const selectDiscount = (state) => {
  const subtotal = selectCartSubtotal(state);
  const coupon = state.cart.appliedCoupon;

  if (!coupon) return 0;

  if (coupon.coupon_type === 'percentage') {
    return subtotal * (parseFloat(coupon.value) / 100);
  } else if (coupon.coupon_type === 'fixed') {
    return Math.min(parseFloat(coupon.value), subtotal);
  }

  return parseFloat(coupon.discount_amount || coupon.potential_discount || 0);
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const tax = selectCartTax(state);
  const delivery = selectDeliveryCharge(state);
  const discount = selectDiscount(state);

  return Math.max(0, subtotal + tax + delivery - discount);
};

export const { setCoupon, clearCoupon, applyCoupon, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
