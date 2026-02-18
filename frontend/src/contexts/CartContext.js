import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, []);

  // Load cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const response = await cartAPI.addItem(productId, quantity);
      setCart(response.data.cart);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add to cart'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    setLoading(true);
    try {
      await cartAPI.updateItem(itemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update quantity'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (itemId) => {
    setLoading(true);
    try {
      await cartAPI.removeItem(itemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove item'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      await cartAPI.clear();
      await fetchCart();
      setAppliedCoupon(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clear cart'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const applyCoupon = useCallback((coupon) => {
    setAppliedCoupon(coupon);
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // Calculate cart totals
  const calculateTotals = useCallback(() => {
    if (!cart) {
      return {
        subtotal: 0,
        tax: 0,
        delivery: 0,
        couponDiscount: 0,
        total: 0,
        itemCount: 0
      };
    }

    const subtotal = parseFloat(cart.total || 0);
    const tax = subtotal * 0.08;
    const delivery = subtotal >= 500 ? 0 : 50;
    const couponDiscount = appliedCoupon ? parseFloat(appliedCoupon.discount || 0) : 0;
    const total = subtotal + tax + delivery - couponDiscount;
    const itemCount = cart.item_count || 0;

    return {
      subtotal,
      tax,
      delivery,
      couponDiscount,
      total,
      itemCount
    };
  }, [cart, appliedCoupon]);

  const value = {
    cart,
    loading,
    appliedCoupon,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    applyCoupon,
    removeCoupon,
    calculateTotals,
    ...calculateTotals()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
