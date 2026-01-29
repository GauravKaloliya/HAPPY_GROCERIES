import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { generateStars } from '../services/productService.js';
import './Cart.css';

const Cart = () => {
    const { 
        cart, 
        cartCount, 
        subtotal, 
        tax, 
        deliveryCharge, 
        couponDiscount, 
        total,
        expressDelivery,
        updateQuantity, 
        removeFromCart, 
        clearCart,
        applyCoupon,
        removeCoupon,
        setExpressDelivery,
        getEstimatedDeliveryText,
        getSuggestedCoupons
    } = useCart();
    
    const [couponCode, setCouponCode] = useState('');
    const [showCoupons, setShowCoupons] = useState(false);

    const suggestedCoupons = getSuggestedCoupons();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleApplyCoupon = () => {
        if (couponCode.trim()) {
            applyCoupon(couponCode.trim().toUpperCase());
            setCouponCode('');
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
    };

    const handleExpressDeliveryToggle = () => {
        setExpressDelivery(!expressDelivery);
    };

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h2 className="empty-cart-title">Your cart is empty</h2>
                        <p className="empty-cart-message">
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                {/* Page Header */}
                <div className="cart-header">
                    <h1 className="cart-title">Shopping Cart ({cartCount} items)</h1>
                    <Link to="/products" className="continue-shopping">
                        ← Continue Shopping
                    </Link>
                </div>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        <div className="cart-items-header">
                            <h3>Items in your cart</h3>
                            <button className="clear-cart-btn" onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                        
                        <div className="cart-items-list">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <span className="item-emoji">{item.emoji}</span>
                                    </div>
                                    
                                    <div className="item-details">
                                        <h4 className="item-name">{item.name}</h4>
                                        <p className="item-category">{item.category}</p>
                                        <div className="item-rating">
                                            <span className="stars">{generateStars(item.rating)}</span>
                                            <span className="rating-text">
                                                {item.rating} ({item.reviewsCount} reviews)
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="item-pricing">
                                        <div className="item-price">
                                            {item.discountPercent > 0 ? (
                                                <>
                                                    <span className="current-price">
                                                        ₹{((item.price * (1 - item.discountPercent / 100)) * item.quantity).toFixed(0)}
                                                    </span>
                                                    <span className="original-price">
                                                        ₹{(item.price * item.quantity).toFixed(0)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="current-price">
                                                    ₹{(item.price * item.quantity).toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="item-unit-price">
                                            ₹{item.discountPercent > 0 
                                                ? (item.price * (1 - item.discountPercent / 100)).toFixed(0)
                                                : item.price.toFixed(0)
                                            } each
                                        </div>
                                    </div>
                                    
                                    <div className="item-quantity">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-display">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <button
                                        className="remove-item-btn"
                                        onClick={() => removeFromCart(item.id)}
                                        aria-label={`Remove ${item.name} from cart`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3 className="summary-title">Order Summary</h3>
                        
                        {/* Delivery Options */}
                        <div className="delivery-options">
                            <h4>Delivery Options</h4>
                            <div className="delivery-option">
                                <input
                                    type="radio"
                                    id="standard"
                                    name="delivery"
                                    checked={!expressDelivery}
                                    onChange={() => setExpressDelivery(false)}
                                />
                                <label htmlFor="standard" className="delivery-label">
                                    <span className="delivery-name">Standard Delivery</span>
                                    <span className="delivery-price">
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                    <span className="delivery-time">
                                        {getEstimatedDeliveryText(cart, false)}
                                    </span>
                                </label>
                            </div>
                            
                            <div className="delivery-option">
                                <input
                                    type="radio"
                                    id="express"
                                    name="delivery"
                                    checked={expressDelivery}
                                    onChange={() => setExpressDelivery(true)}
                                />
                                <label htmlFor="express" className="delivery-label">
                                    <span className="delivery-name">Express Delivery</span>
                                    <span className="delivery-price">
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                    <span className="delivery-time">
                                        {getEstimatedDeliveryText(cart, true)}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="coupon-section">
                            <h4>Apply Coupon</h4>
                            <div className="coupon-input-group">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="coupon-input"
                                />
                                <button
                                    className="apply-coupon-btn"
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode.trim()}
                                >
                                    Apply
                                </button>
                            </div>
                            
                            <button
                                className="show-coupons-btn"
                                onClick={() => setShowCoupons(!showCoupons)}
                            >
                                View Available Coupons
                            </button>
                            
                            {showCoupons && (
                                <div className="available-coupons">
                                    {suggestedCoupons.slice(0, 3).map(coupon => (
                                        <div key={coupon.code} className="coupon-card">
                                            <div className="coupon-code">{coupon.code}</div>
                                            <div className="coupon-description">{coupon.description}</div>
                                            <div className="coupon-eligibility">
                                                {coupon.eligibility === 'applicable' ? (
                                                    <span className="eligible">✅ Eligible</span>
                                                ) : (
                                                    <span className="not-eligible">❌ {coupon.eligibilityReason}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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

                        {/* Checkout Button */}
                        <Link to="/checkout" className="checkout-btn">
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;