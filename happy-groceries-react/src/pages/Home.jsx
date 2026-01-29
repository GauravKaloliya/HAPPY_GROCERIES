import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getCategories } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        // Load featured products and categories
        setFeaturedProducts(getFeaturedProducts());
        setCategories(getCategories().filter(cat => cat !== 'All').slice(0, 5));
    }, []);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Fresh Groceries
                                <span className="hero-subtitle"> Delivered to Your Door</span>
                            </h1>
                            <p className="hero-description">
                                Shop from our wide selection of fresh fruits, vegetables, dairy products, 
                                and snacks. All delivered with love and care!
                            </p>
                            <div className="hero-actions">
                                <Link to="/products" className="btn btn-primary btn-lg">
                                    🛍️ Start Shopping
                                </Link>
                                <Link to="/offers" className="btn btn-outline btn-lg">
                                    🎁 View Offers
                                </Link>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="hero-illustration">
                                <div className="floating-icon">🍎</div>
                                <div className="floating-icon">🥛</div>
                                <div className="floating-icon">🍞</div>
                                <div className="floating-icon">🥕</div>
                                <div className="floating-icon">🧀</div>
                                <div className="floating-icon">🥤</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3 className="feature-title">Fast Delivery</h3>
                            <p className="feature-description">
                                Get your groceries delivered within 45 minutes or less!
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌱</div>
                            <h3 className="feature-title">Fresh Quality</h3>
                            <p className="feature-description">
                                All products are carefully selected for maximum freshness and quality.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3 className="feature-title">Best Prices</h3>
                            <p className="feature-description">
                                Competitive prices with exciting offers and discounts every day.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3 className="feature-title">Safe & Secure</h3>
                            <p className="feature-description">
                                Your data and payments are protected with industry-standard security.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Shop by Category</h2>
                        <p className="section-description">
                            Explore our wide range of fresh products organized by category
                        </p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((category, index) => {
                            const categoryIcons = {
                                'Fruits': '🍎',
                                'Vegetables': '🥕',
                                'Dairy': '🥛',
                                'Snacks': '🍪',
                                'Beverages': '🥤'
                            };
                            const categoryColors = [
                                'var(--primary-pink)',
                                'var(--primary-green)', 
                                'var(--primary-blue)',
                                'var(--primary-yellow)',
                                'var(--primary-orange)'
                            ];
                            
                            return (
                                <Link
                                    key={category}
                                    to={`/products?category=${category}`}
                                    className="category-card"
                                    style={{ '--category-color': categoryColors[index] }}
                                >
                                    <div className="category-icon">
                                        {categoryIcons[category]}
                                    </div>
                                    <h3 className="category-title">{category}</h3>
                                    <p className="category-description">
                                        Fresh {category.toLowerCase()} delivered daily
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Today's Special Offers</h2>
                        <p className="section-description">
                            Don't miss out on these amazing deals with up to 30% off!
                        </p>
                    </div>
                    <div className="products-grid">
                        {featuredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                    <div className="section-actions">
                        <Link to="/products" className="btn btn-primary">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <div className="cta-text">
                            <h2 className="cta-title">Ready to Start Shopping?</h2>
                            <p className="cta-description">
                                Join thousands of happy customers who trust us for their daily grocery needs. 
                                Sign up now and get exclusive offers!
                            </p>
                            <div className="cta-actions">
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Sign Up Free
                                </Link>
                                <Link to="/products" className="btn btn-outline btn-lg">
                                    Browse Products
                                </Link>
                            </div>
                        </div>
                        <div className="cta-visual">
                            <div className="cta-illustration">
                                <div className="delivery-icon float">🚚</div>
                                <div className="shopping-icon bounce">🛒</div>
                                <div className="happy-icon glow">😊</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;