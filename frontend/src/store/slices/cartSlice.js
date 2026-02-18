import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cart';
import { TAX_RATE, DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../../utils/constants';

const initialState = {
  items: [],
  loading: false,
  error: null,
  coupon: null,
  appliedCoupon: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addItem(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateItem(itemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      await cartAPI.removeItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartAPI.clearCart();
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
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
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.coupon = null;
        state.appliedCoupon = null;
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    return total + price * item.quantity;
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
  
  if (coupon.type === 'percentage') {
    return subtotal * (coupon.discount / 100);
  }
  return coupon.discount;
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const tax = selectCartTax(state);
  const delivery = selectDeliveryCharge(state);
  const discount = selectDiscount(state);
  
  return subtotal + tax + delivery - discount;
};

export const { setCoupon, clearCoupon, applyCoupon, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
