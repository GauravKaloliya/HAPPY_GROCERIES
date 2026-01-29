import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { generateStars } from '../services/productService.js';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    
    const { addToCart, isInCart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const productData = getProductById(id);
                
                if (!productData) {
                    navigate('/404');
                    return;
                }
                
                setProduct(productData);
            } catch (error) {
                console.error('Error loading product:', error);
                navigate('/404');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id, navigate]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return (
            <div className="product-details-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner-large"></div>
                        <p>Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-details-page">
                <div className="container">
                    <div className="not-found">
                        <h2>Product Not Found</h2>
                        <p>The product you're looking for doesn't exist.</p>
                        <Link to="/products" className="btn btn-primary">
                            Back to Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const effectivePrice = product.discountPercent > 0 
        ? product.price * (1 - product.discountPercent / 100)
        : product.price;

    const discountAmount = product.discountPercent > 0 
        ? product.price - effectivePrice
        : 0;

    const inCart = isInCart(product.id);

    return (
        <div className="product-details-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/products" className="breadcrumb-link">Products</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to={`/products?category=${product.category}`} className="breadcrumb-link">
                        {product.category}
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{product.name}</span>
                </nav>

                <div className="product-details-container">
                    {/* Product Image */}
                    <div className="product-image-section">
                        <div className="product-image">
                            <span className="product-emoji">{product.emoji}</span>
                            {product.discountPercent > 0 && (
                                <div className="discount-badge-large">
                                    -{product.discountPercent}% OFF
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <div className="product-header">
                            <h1 className="product-name">{product.name}</h1>
                            <p className="product-category">{product.category}</p>
                            
                            {/* Rating */}
                            <div className="product-rating">
                                <span className="stars">{generateStars(product.rating)}</span>
                                <span className="rating-text">
                                    {product.rating} ({product.reviewsCount} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="product-pricing">
                            {product.discountPercent > 0 ? (
                                <>
                                    <div className="price-main">
                                        <span className="current-price">₹{effectivePrice.toFixed(0)}</span>
                                        <span className="original-price">₹{product.price}</span>
                                    </div>
                                    <div className="discount-info">
                                        <span className="discount-amount">Save ₹{discountAmount.toFixed(0)}</span>
                                        <span className="discount-percent">({product.discountPercent}% off)</span>
                                    </div>
                                </>
                            ) : (
                                <div className="price-main">
                                    <span className="current-price">₹{product.price}</span>
                                </div>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="product-stock">
                            <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                <span className="stock-icon">
                                    {product.stock > 0 ? '✅' : '❌'}
                                </span>
                                <span className="stock-text">
                                    {product.stock > 0 ? (
                                        product.stock <= 10 ? `Only ${product.stock} left in stock!` : 'In Stock'
                                    ) : (
                                        'Out of Stock'
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        {/* Add to Cart Section */}
                        {product.stock > 0 && (
                            <div className="product-actions">
                                <div className="quantity-selector">
                                    <label className="quantity-label">Quantity:</label>
                                    <div className="quantity-controls">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-display">{quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-actions">
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
                                    
                                    <button className="buy-now-btn">
                                        <span className="btn-icon">⚡</span>
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quick Info */}
                        <div className="product-highlights">
                            <h3>Product Highlights</h3>
                            <ul className="highlights-list">
                                <li>🌱 Fresh and organic</li>
                                <li>🚚 Free delivery available</li>
                                <li>💰 Best price guarantee</li>
                                <li>🛡️ 100% quality assured</li>
                                <li>📦 Easy returns & exchanges</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="related-products">
                    <h2 className="related-title">You might also like</h2>
                    <p className="related-subtitle">Check out these similar products</p>
                    <div className="related-cta">
                        <Link to="/products" className="btn btn-outline">
                            View All Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;