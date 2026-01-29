import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="container">
                <div className="not-found-content">
                    <div className="not-found-illustration">
                        <div className="error-number">404</div>
                        <div className="error-icon">🛒❓</div>
                    </div>
                    
                    <div className="not-found-message">
                        <h1 className="error-title">Oops! Page Not Found</h1>
                        <p className="error-description">
                            The page you're looking for seems to have wandered off to another aisle! 
                            Let's get you back to shopping.
                        </p>
                    </div>
                    
                    <div className="not-found-actions">
                        <Link to="/" className="btn btn-primary btn-lg">
                            🏠 Go Home
                        </Link>
                        <Link to="/products" className="btn btn-outline btn-lg">
                            🛍️ Browse Products
                        </Link>
                    </div>
                    
                    <div className="helpful-links">
                        <h3>While you're here, check out:</h3>
                        <div className="links-grid">
                            <Link to="/products" className="helpful-link">
                                <div className="link-icon">🍎</div>
                                <div className="link-text">
                                    <h4>Fresh Products</h4>
                                    <p>Browse our wide selection</p>
                                </div>
                            </Link>
                            
                            <Link to="/offers" className="helpful-link">
                                <div className="link-icon">🎁</div>
                                <div className="link-text">
                                    <h4>Special Offers</h4>
                                    <p>Save on your favorite items</p>
                                </div>
                            </Link>
                            
                            <Link to="/cart" className="helpful-link">
                                <div className="link-icon">🛒</div>
                                <div className="link-text">
                                    <h4>Shopping Cart</h4>
                                    <p>Review your items</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;