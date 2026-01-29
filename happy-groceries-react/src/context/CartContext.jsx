import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService.js';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
    cart: [],
    appliedCoupon: null,
    cartCount: 0,
    subtotal: 0,
    tax: 0,
    deliveryCharge: 0,
    couponDiscount: 0,
    total: 0,
    expressDelivery: false,
    loading: false
};

// Action types
const CartActionTypes = {
    LOAD_CART: 'LOAD_CART',
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    APPLY_COUPON: 'APPLY_COUPON',
    REMOVE_COUPON: 'REMOVE_COUPON',
    SET_EXPRESS_DELIVERY: 'SET_EXPRESS_DELIVERY',
    UPDATE_CALCULATIONS: 'UPDATE_CALCULATIONS',
    SET_LOADING: 'SET_LOADING'
};

// Reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case CartActionTypes.LOAD_CART:
            return {
                ...state,
                cart: action.payload.cart,
                appliedCoupon: action.payload.appliedCoupon,
                cartCount: action.payload.cartCount,
                subtotal: action.payload.subtotal,
                tax: action.payload.tax,
                deliveryCharge: action.payload.deliveryCharge,
                couponDiscount: action.payload.couponDiscount,
                total: action.payload.total
            };

        case CartActionTypes.ADD_TO_CART:
            return {
                ...state,
                cart: action.payload.cart,
                cartCount: action.payload.cartCount
            };

        case CartActionTypes.REMOVE_FROM_CART:
            return {
                ...state,
                cart: action.payload.cart,
                cartCount: action.payload.cartCount
            };

        case CartActionTypes.UPDATE_QUANTITY:
            return {
                ...state,
                cart: action.payload.cart,
                cartCount: action.payload.cartCount
            };

        case CartActionTypes.CLEAR_CART:
            return {
                ...initialState
            };

        case CartActionTypes.APPLY_COUPON:
            return {
                ...state,
                appliedCoupon: action.payload.appliedCoupon,
                couponDiscount: action.payload.couponDiscount,
                total: action.payload.total
            };

        case CartActionTypes.REMOVE_COUPON:
            return {
                ...state,
                appliedCoupon: null,
                couponDiscount: 0,
                total: action.payload.total
            };

        case CartActionTypes.SET_EXPRESS_DELIVERY:
            return {
                ...state,
                expressDelivery: action.payload,
                deliveryCharge: action.payload ? action.payload.deliveryCharge : action.payload.deliveryCharge,
                total: action.payload.total
            };

        case CartActionTypes.UPDATE_CALCULATIONS:
            return {
                ...state,
                subtotal: action.payload.subtotal,
                tax: action.payload.tax,
                deliveryCharge: action.payload.deliveryCharge,
                couponDiscount: action.payload.couponDiscount,
                total: action.payload.total
            };

        case CartActionTypes.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        default:
            return state;
    }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart data on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Listen for cart updates from other components
    useEffect(() => {
        const handleCartUpdate = () => {
            loadCart();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const loadCart = () => {
        try {
            const cart = cartService.getCart();
            const appliedCoupon = cartService.getAppliedCoupon();
            const cartCount = cartService.getCartCount();
            const subtotal = cartService.calculateSubtotal();
            const tax = cartService.calculateTax(subtotal);
            const deliveryCharge = cartService.calculateDeliveryCharge(subtotal, state.expressDelivery);
            const couponDiscount = cartService.calculateCouponDiscount();
            const total = subtotal + tax + deliveryCharge - couponDiscount;

            dispatch({
                type: CartActionTypes.LOAD_CART,
                payload: {
                    cart,
                    appliedCoupon,
                    cartCount,
                    subtotal,
                    tax,
                    deliveryCharge,
                    couponDiscount,
                    total
                }
            });
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    // Add item to cart
    const addToCart = (product, quantity = 1) => {
        try {
            const result = cartService.addToCart(product, quantity);
            
            if (result.success) {
                loadCart(); // Reload cart to get updated state
                toast.success(result.message);
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart');
            return { success: false, error: 'Failed to add item to cart' };
        }
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        try {
            const result = cartService.removeFromCart(productId);
            
            if (result.success) {
                loadCart(); // Reload cart to get updated state
                toast.success(result.message);
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item from cart');
            return { success: false, error: 'Failed to remove item from cart' };
        }
    };

    // Update item quantity
    const updateQuantity = (productId, quantity) => {
        try {
            const result = cartService.updateQuantity(productId, quantity);
            
            if (result.success) {
                loadCart(); // Reload cart to get updated state
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
            return { success: false, error: 'Failed to update quantity' };
        }
    };

    // Clear entire cart
    const clearCart = () => {
        try {
            cartService.clearCart();
            dispatch({ type: CartActionTypes.CLEAR_CART });
            toast.success('Cart cleared');
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
            return { success: false, error: 'Failed to clear cart' };
        }
    };

    // Apply coupon
    const applyCoupon = (couponCode) => {
        try {
            const result = cartService.applyCoupon(couponCode);
            
            if (result.success) {
                loadCart(); // Reload cart to get updated calculations
                toast.success(result.message);
                return { success: true };
            } else {
                toast.error(result.message);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error('Failed to apply coupon');
            return { success: false, error: 'Failed to apply coupon' };
        }
    };

    // Remove coupon
    const removeCoupon = () => {
        try {
            const result = cartService.removeCoupon();
            
            if (result.success) {
                loadCart(); // Reload cart to get updated calculations
                toast.success(result.message);
                return { success: true };
            } else {
                toast.error(result.message);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Error removing coupon:', error);
            toast.error('Failed to remove coupon');
            return { success: false, error: 'Failed to remove coupon' };
        }
    };

    // Set express delivery
    const setExpressDelivery = (express) => {
        try {
            const deliveryCharge = cartService.calculateDeliveryCharge(state.subtotal, express);
            const total = state.subtotal + state.tax + deliveryCharge - state.couponDiscount;

            dispatch({
                type: CartActionTypes.SET_EXPRESS_DELIVERY,
                payload: {
                    express,
                    deliveryCharge,
                    total
                }
            });

            return { success: true };
        } catch (error) {
            console.error('Error setting express delivery:', error);
            toast.error('Failed to update delivery option');
            return { success: false, error: 'Failed to update delivery option' };
        }
    };

    // Get suggested coupons
    const getSuggestedCoupons = () => {
        try {
            return cartService.getSuggestedCoupons();
        } catch (error) {
            console.error('Error getting suggested coupons:', error);
            return [];
        }
    };

    // Get smart offer recommendation
    const getSmartOfferRecommendation = () => {
        try {
            return cartService.getSmartOfferRecommendation();
        } catch (error) {
            console.error('Error getting smart offer recommendation:', error);
            return { topRecommendation: null, alternatives: [], explanation: "No offers available" };
        }
    };

    // Get estimated delivery time
    const getEstimatedDeliveryText = (expressDelivery = false) => {
        try {
            return cartService.getEstimatedDeliveryText(state.cart, expressDelivery);
        } catch (error) {
            console.error('Error getting delivery estimate:', error);
            return "Delivery time not available";
        }
    };

    // Check if product is in cart
    const isInCart = (productId) => {
        return state.cart.some(item => item.id === productId);
    };

    // Get product quantity in cart
    const getProductQuantity = (productId) => {
        const item = state.cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    // Value object
    const value = {
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setExpressDelivery,
        getSuggestedCoupons,
        getSmartOfferRecommendation,
        getEstimatedDeliveryText,
        isInCart,
        getProductQuantity,
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};