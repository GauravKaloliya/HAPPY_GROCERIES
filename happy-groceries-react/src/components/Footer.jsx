import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <span className="logo-icon">🛒</span>
                            <span className="logo-text">Happy Groceries</span>
                        </div>
                        <p className="footer-description">
                            Your one-stop destination for fresh groceries and quality products. 
                            Shop with confidence and enjoy fast delivery!
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                📘
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                🐦
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                📷
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                💼
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/" className="footer-link">Home</Link></li>
                            <li><Link to="/products" className="footer-link">All Products</Link></li>
                            <li><Link to="/offers" className="footer-link">Offers</Link></li>
                            <li><Link to="/cart" className="footer-link">Shopping Cart</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Categories</h3>
                        <ul className="footer-links">
                            <li><Link to="/products?category=Fruits" className="footer-link">Fruits</Link></li>
                            <li><Link to="/products?category=Vegetables" className="footer-link">Vegetables</Link></li>
                            <li><Link to="/products?category=Dairy" className="footer-link">Dairy</Link></li>
                            <li><Link to="/products?category=Snacks" className="footer-link">Snacks</Link></li>
                            <li><Link to="/products?category=Beverages" className="footer-link">Beverages</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Customer Service</h3>
                        <ul className="footer-links">
                            <li><a href="#" className="footer-link">Help Center</a></li>
                            <li><a href="#" className="footer-link">Track Your Order</a></li>
                            <li><a href="#" className="footer-link">Return Policy</a></li>
                            <li><a href="#" className="footer-link">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Contact Info</h3>
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span className="contact-text">123 Fresh Street, Grocery City, GC 12345</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <span className="contact-text">+1 (555) 123-4567</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">✉️</span>
                                <span className="contact-text">support@happygroceries.com</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">🕒</span>
                                <span className="contact-text">Mon-Sun: 8:00 AM - 10:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © 2024 Happy Groceries. All rights reserved.
                        </p>
                        <div className="footer-bottom-links">
                            <a href="#" className="footer-bottom-link">Privacy Policy</a>
                            <a href="#" className="footer-bottom-link">Terms of Service</a>
                            <a href="#" className="footer-bottom-link">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;