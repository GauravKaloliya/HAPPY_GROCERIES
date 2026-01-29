import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { generateStars } from '../services/productService.js';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, showQuickAdd = true }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { isAuthenticated } = useAuth();
    const { addToCart: addToCartContext, isInCart } = useCart();

    const effectivePrice = product.discountPercent > 0 
        ? product.price * (1 - product.discountPercent / 100)
        : product.price;

    const discountAmount = product.discountPercent > 0 
        ? product.price - effectivePrice
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (onAddToCart) {
            onAddToCart(product, quantity);
        } else {
            addToCartContext(product, quantity);
        }
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            // Redirect to login or show message
            return;
        }
        
        setIsWishlisted(!isWishlisted);
        // TODO: Implement wishlist functionality
    };

    const inCart = isInCart(product.id);

    return (
        <div className="product-card">
            <Link to={`/products/${product.id}`} className="product-link">
                {/* Discount Badge */}
                {product.discountPercent > 0 && (
                    <div className="discount-badge">
                        -{product.discountPercent}%
                    </div>
                )}

                {/* Wishlist Button */}
                {isAuthenticated && (
                    <button
                        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={handleWishlistToggle}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        {isWishlisted ? '💖' : '🤍'}
                    </button>
                )}

                {/* Product Image/Emoji */}
                <div className="product-image">
                    <span className="product-emoji">{product.emoji}</span>
                    {product.stock === 0 && (
                        <div className="out-of-stock-overlay">
                            Out of Stock
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    
                    {/* Rating */}
                    <div className="product-rating">
                        <span className="stars">{generateStars(product.rating)}</span>
                        <span className="rating-text">
                            {product.rating} ({product.reviewsCount} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="product-price">
                        {product.discountPercent > 0 ? (
                            <>
                                <span className="current-price">₹{effectivePrice.toFixed(0)}</span>
                                <span className="original-price">₹{product.price}</span>
                                <span className="discount-amount">Save ₹{discountAmount.toFixed(0)}</span>
                            </>
                        ) : (
                            <span className="current-price">₹{product.price}</span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? (
                            <>
                                <span className="stock-icon">✅</span>
                                {product.stock <= 10 ? `Only ${product.stock} left!` : 'In Stock'}
                            </>
                        ) : (
                            <>
                                <span className="stock-icon">❌</span>
                                Out of Stock
                            </>
                        )}
                    </div>
                </div>
            </Link>

            {/* Add to Cart Section */}
            {showQuickAdd && product.stock > 0 && (
                <div className="product-actions">
                    <div className="quantity-selector">
                        <button
                            className="quantity-btn"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span className="quantity-display">{quantity}</span>
                        <button
                            className="quantity-btn"
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={quantity >= product.stock}
                        >
                            +
                        </button>
                    </div>
                    
                    <button
                        className={`add-to-cart-btn ${inCart ? 'in-cart' : ''}`}
                        onClick={handleAddToCart}
                        disabled={inCart}
                    >
                        {inCart ? (
                            <>
                                <span className="btn-icon">🛒</span>
                                In Cart
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">🛒</span>
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Product Description Preview */}
            <div className="product-description">
                <p>{product.description}</p>
            </div>
        </div>
    );
};

export default ProductCard;