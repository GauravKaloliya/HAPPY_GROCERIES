import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cart';
import { couponsAPI } from '../../api/coupons';
import { productsAPI } from '../../api/products';
import { logout } from './authSlice';

const GUEST_CART_KEY = 'guestCart';

const normalizeGuestItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const productId = item?.product?.id ?? item?.product_id ?? item?.id ?? item?.productId;
    const variantId = item?.variant?.id ?? item?.variant_id ?? item?.variantId ?? 'default';
    const cartKey = item?.cart_key || `${productId}:${variantId}`;
    return {
      ...item,
      id: cartKey,
      cart_key: cartKey,
      variant_id: item?.variant?.id ?? item?.variant_id ?? item?.variantId ?? null,
    };
  });
};

const getGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return normalizeGuestItems(parsed);
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(normalizeGuestItems(items)));
};

const getInitialItems = () => {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken ? [] : getGuestCart();
};

const getCartItemKey = (item) => {
  if (item?.cart_key) return item.cart_key;
  const productId = item?.product?.id ?? item?.product_id ?? item?.id ?? item?.productId;
  const variantId = item?.variant?.id ?? item?.variant_id ?? item?.variantId ?? 'default';
  return `${productId}:${variantId}`;
};

const coerceCartItems = (payload) => {
  const raw = payload?.items ?? payload;
  if (!Array.isArray(raw)) return [];
  return raw;
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
  async ({ productId, variantId = null, quantity = 1, product, variant }, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        const items = getGuestCart();
        const cartKey = `${productId}:${variantId || 'default'}`;
        const existingItemIndex = items.findIndex((item) => getCartItemKey(item) === cartKey);
        let productData = product || (existingItemIndex >= 0 ? items[existingItemIndex].product : null);

        if (!productData) {
          const response = await productsAPI.getById(productId);
          productData = response.data;
        }

        const selectedVariant = variant
          || productData?.variants?.find((v) => v.id === variantId)
          || productData?.default_variant
          || null;
        const variantStock = selectedVariant?.stock_quantity;
        const maxQuantity = variantStock !== undefined && variantStock !== null
          ? Math.min(variantStock, 99)
          : (productData?.stock ? Math.min(productData.stock, 99) : 99);

        if (existingItemIndex >= 0) {
          // Update existing item immutably
          items[existingItemIndex] = {
            ...items[existingItemIndex],
            quantity: Math.min(items[existingItemIndex].quantity + quantity, maxQuantity)
          };
        } else {
          items.push({
            id: cartKey,
            cart_key: cartKey,
            product: productData,
            variant: selectedVariant,
            variant_id: selectedVariant?.id ?? variantId ?? null,
            quantity: Math.min(quantity, maxQuantity),
          });
        }

        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.addItem(productId, quantity, variantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, variantId = null }, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      if (!isAuthenticated) {
        const items = getGuestCart();
        const itemIndex = items.findIndex((item) => getCartItemKey(item) === itemId);
        if (itemIndex === -1) {
          return rejectWithValue('Cart item not found');
        }

        if (quantity <= 0) {
          items.splice(itemIndex, 1);
        } else {
          const item = items[itemIndex];
          const selectedVariant = variantId
            ? item.product?.variants?.find((v) => v.id === variantId)
            : item.variant;
          const variantStock = selectedVariant?.stock_quantity;
          const maxQuantity = variantStock !== undefined && variantStock !== null
            ? Math.min(variantStock, 99)
            : (item.product?.stock ? Math.min(item.product.stock, 99) : 99);

          if (variantId && (!item.variant || item.variant.id !== variantId)) {
            const newKey = `${item.product?.id}:${variantId || 'default'}`;
            const existingIndex = items.findIndex((candidate, idx) =>
              idx !== itemIndex && getCartItemKey(candidate) === newKey
            );
            if (existingIndex >= 0) {
              items[existingIndex] = {
                ...items[existingIndex],
                quantity: Math.min(items[existingIndex].quantity + quantity, maxQuantity),
              };
              items.splice(itemIndex, 1);
            } else {
              items[itemIndex] = {
                ...item,
                id: newKey,
                cart_key: newKey,
                variant: selectedVariant || item.variant,
                variant_id: variantId,
                quantity: Math.min(quantity, maxQuantity),
              };
            }
          } else {
            items[itemIndex] = {
              ...item,
              quantity: Math.min(quantity, maxQuantity)
            };
          }
        }

        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.updateItem(itemId, quantity, variantId);
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
        const items = getGuestCart().filter((item) => getCartItemKey(item) !== itemId);
        saveGuestCart(items);
        return { items };
      }

      const response = await cartAPI.removeItem(itemId);
      return response.data;
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
  async ({ code, cartTotal, cartItems }, { rejectWithValue }) => {
    try {
      const response = await couponsAPI.validate(code, cartTotal, cartItems);
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
        state.items = coerceCartItems(action.payload);
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
        // For authenticated users, the API returns the full cart
        // For guest users, action.payload.items contains the items
        if (action.payload && action.payload.items) {
          // Full cart response from API or guest cart
          state.items = coerceCartItems(action.payload);
        } else if (action.payload && action.payload.id) {
          // Single item response - check if it already exists
          const payloadProductId = action.payload.product?.id;
          const existingIndex = state.items.findIndex((item) => {
            if (payloadProductId) {
              return item.product?.id === payloadProductId;
            }
            return item.id === action.payload.id;
          });
          if (existingIndex >= 0) {
            state.items[existingIndex] = action.payload;
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
          state.items = coerceCartItems(action.payload);
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
          state.items = coerceCartItems(action.payload);
          return;
        }
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = coerceCartItems(action.payload);
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
export const selectCartItems = (state) => (
  Array.isArray(state.cart?.items) ? state.cart.items : []
);
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartCount = (state) => (state.cart.items || []).length;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;

export const selectCartSubtotal = (state) => {
  const items = state.cart?.items || [];
  return items.reduce((total, item) => {
    if (item?.total !== undefined && item?.total !== null) {
      return total + (parseFloat(item.total) || 0);
    }
    const variantPrice = parseFloat(item?.variant?.price || 0);
    const productPrice = parseFloat(item?.product?.price || item?.price || 0) || 0;
    const basePrice = variantPrice || productPrice;
    const discountPercent = parseFloat(item?.product?.discount_percent || 0) || 0;
    const effectivePrice = discountPercent > 0
      ? basePrice * (1 - discountPercent / 100)
      : basePrice;
    const quantity = item?.quantity || 0;
    return total + effectivePrice * quantity;
  }, 0);
};

export const selectCartTax = (state) => {
  const taxRate = state.config?.settings?.tax_rate || 0.08;
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
