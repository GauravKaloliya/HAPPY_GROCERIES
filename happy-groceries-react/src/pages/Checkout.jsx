import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cartService } from '../services/cartService.js';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, cartCount, subtotal, tax, deliveryCharge, couponDiscount, total, expressDelivery } = useCart();
    const { isAuthenticated, user } = useAuth();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        deliveryInstructions: ''
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if cart is empty or user not authenticated
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
            return;
        }
        
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }
        
        // Pre-fill user data
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [cart.length, isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order object
            const order = {
                id: Date.now().toString(),
                userId: user.id,
                items: cart,
                deliveryInfo: formData,
                pricing: {
                    subtotal,
                    tax,
                    deliveryCharge,
                    couponDiscount,
                    total,
                    expressDelivery
                },
                status: 'confirmed',
                estimatedDelivery: cartService.getEstimatedDeliveryText(cart, expressDelivery),
                createdAt: new Date().toISOString()
            };

            // Save order (in a real app, this would be an API call)
            const orders = JSON.parse(localStorage.getItem('happyGroceries_orders') || '[]');
            orders.push(order);
            localStorage.setItem('happyGroceries_orders', JSON.stringify(orders));

            // Mark coupon as used if one was applied
            const appliedCoupon = cartService.getAppliedCoupon();
            if (appliedCoupon) {
                cartService.markCouponAsUsed(appliedCoupon.code);
            }

            // Clear cart
            cartService.clearCart();

            // Navigate to success page
            navigate('/order-success', { state: { order } });

        } catch (error) {
            console.error('Order processing error:', error);
            setErrors({ submit: 'Failed to process order. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isAuthenticated || cart.length === 0) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-header">
                    <h1 className="checkout-title">Checkout</h1>
                    <p className="checkout-subtitle">Complete your order details</p>
                </div>

                <div className="checkout-content">
                    {/* Checkout Form */}
                    <div className="checkout-form">
                        <form onSubmit={handleSubmit}>
                            {/* Personal Information */}
                            <div className="form-section">
                                <h3 className="section-title">Personal Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                        {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                        {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className={`form-input ${errors.email ? 'error' : ''}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        {errors.email && <span className="form-error">{errors.email}</span>}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className={`form-input ${errors.phone ? 'error' : ''}`}
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength="10"
                                        />
                                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="form-section">
                                <h3 className="section-title">Delivery Address</h3>
                                <div className="form-group">
                                    <label htmlFor="address" className="form-label">
                                        Street Address *
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        className={`form-input ${errors.address ? 'error' : ''}`}
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                    {errors.address && <span className="form-error">{errors.address}</span>}
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city" className="form-label">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            className={`form-input ${errors.city ? 'error' : ''}`}
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                        {errors.city && <span className="form-error">{errors.city}</span>}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="state" className="form-label">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            className={`form-input ${errors.state ? 'error' : ''}`}
                                            value={formData.state}
                                            onChange={handleChange}
                                        />
                                        {errors.state && <span className="form-error">{errors.state}</span>}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="zipCode" className="form-label">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            className={`form-input ${errors.zipCode ? 'error' : ''}`}
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                        />
                                        {errors.zipCode && <span className="form-error">{errors.zipCode}</span>}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="deliveryInstructions" className="form-label">
                                        Delivery Instructions (Optional)
                                    </label>
                                    <textarea
                                        id="deliveryInstructions"
                                        name="deliveryInstructions"
                                        className="form-input"
                                        value={formData.deliveryInstructions}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Any special instructions for delivery..."
                                    />
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="form-error submit-error">
                                    {errors.submit}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="place-order-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Processing Order...
                                    </>
                                ) : (
                                    `Place Order - ₹${total.toFixed(0)}`
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <h3 className="summary-title">Order Summary</h3>
                        
                        {/* Order Items */}
                        <div className="order-items">
                            {cart.map(item => (
                                <div key={item.id} className="summary-item">
                                    <div className="item-info">
                                        <span className="item-emoji">{item.emoji}</span>
                                        <div className="item-details">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-quantity">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="item-price">
                                        ₹{((item.discountPercent > 0 
                                            ? item.price * (1 - item.discountPercent / 100) 
                                            : item.price) * item.quantity).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Subtotal ({cartCount} items)</span>
                                <span>₹{subtotal.toFixed(0)}</span>
                            </div>
                            
                            <div className="price-row">
                                <span>Delivery Fee</span>
                                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(0)}`}</span>
                            </div>
                            
                            <div className="price-row">
                                <span>Tax</span>
                                <span>₹{tax.toFixed(0)}</span>
                            </div>
                            
                            {couponDiscount > 0 && (
                                <div className="price-row discount">
                                    <span>Coupon Discount</span>
                                    <span>-₹{couponDiscount.toFixed(0)}</span>
                                </div>
                            )}
                            
                            <div className="price-row total">
                                <span>Total</span>
                                <span>₹{total.toFixed(0)}</span>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="delivery-info">
                            <h4>Delivery Information</h4>
                            <p className="delivery-text">
                                {expressDelivery ? '🚚 Express Delivery' : '🚚 Standard Delivery'}
                            </p>
                            <p className="delivery-time">
                                Estimated delivery: {cartService.getEstimatedDeliveryText(cart, expressDelivery)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;