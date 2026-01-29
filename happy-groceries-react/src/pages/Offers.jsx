import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cartService.js';
import './Offers.css';

const Offers = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const coupons = cartService.getSuggestedCoupons();

    const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages'];

    const filteredCoupons = selectedCategory === 'All' 
        ? coupons 
        : coupons.filter(coupon => 
            coupon.applicableCategories.includes(selectedCategory) || 
            coupon.applicableCategories.length === 0
          );

    const getCouponCardClass = (eligibility) => {
        switch (eligibility) {
            case 'applicable':
                return 'coupon-card applicable';
            case 'almost':
                return 'coupon-card almost';
            default:
                return 'coupon-card not-applicable';
        }
    };

    const getEligibilityIcon = (eligibility) => {
        switch (eligibility) {
            case 'applicable':
                return '✅';
            case 'almost':
                return '⏳';
            default:
                return '❌';
        }
    };

    return (
        <div className="offers-page">
            <div className="container">
                {/* Page Header */}
                <div className="offers-header">
                    <h1 className="offers-title">🎁 Special Offers & Coupons</h1>
                    <p className="offers-subtitle">
                        Save money on your groceries with our amazing deals and discounts!
                    </p>
                </div>

                {/* Offers Stats */}
                <div className="offers-stats">
                    <div className="stat-item">
                        <div className="stat-icon">🎫</div>
                        <div className="stat-content">
                            <div className="stat-number">{coupons.length}</div>
                            <div className="stat-label">Available Coupons</div>
                        </div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <div className="stat-number">
                                ₹{coupons.filter(c => c.eligibility === 'applicable').reduce((sum, c) => sum + c.potentialDiscount, 0).toFixed(0)}
                            </div>
                            <div className="stat-label">Max Savings Available</div>
                        </div>
                    </div>
                    
                    <div className="stat-item">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <div className="stat-number">
                                {coupons.filter(c => c.eligibility === 'applicable').length}
                            </div>
                            <div className="stat-label">Ready to Use</div>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="category-filter">
                    <h3>Filter by Category</h3>
                    <div className="category-buttons">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Smart Recommendations */}
                <div className="smart-recommendations">
                    <h2 className="section-title">🤖 Smart Recommendations</h2>
                    {(() => {
                        const recommendation = cartService.getSmartOfferRecommendation();
                        if (recommendation.topRecommendation) {
                            return (
                                <div className="recommendation-card">
                                    <div className="recommendation-header">
                                        <div className="recommendation-icon">🎯</div>
                                        <div className="recommendation-content">
                                            <h3>Recommended for you</h3>
                                            <p>{recommendation.explanation}</p>
                                        </div>
                                    </div>
                                    
                                    {recommendation.topRecommendation && (
                                        <div className="recommended-coupon">
                                            <div className="coupon-code-large">{recommendation.topRecommendation.code}</div>
                                            <div className="coupon-details">
                                                <div className="coupon-description">
                                                    {recommendation.topRecommendation.description}
                                                </div>
                                                <div className="coupon-savings">
                                                    Save up to ₹{recommendation.topRecommendation.potentialDiscount.toFixed(0)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {recommendation.alternatives.length > 0 && (
                                        <div className="alternative-offers">
                                            <h4>Other great offers:</h4>
                                            <div className="alternatives-list">
                                                {recommendation.alternatives.map(alt => (
                                                    <div key={alt.code} className="alternative-item">
                                                        <span className="alt-code">{alt.code}</span>
                                                        <span className="alt-savings">₹{alt.potentialDiscount.toFixed(0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* All Offers */}
                <div className="all-offers">
                    <h2 className="section-title">All Available Offers</h2>
                    
                    <div className="offers-grid">
                        {filteredCoupons.map(coupon => (
                            <div key={coupon.code} className={getCouponCardClass(coupon.eligibility)}>
                                <div className="coupon-header">
                                    <div className="coupon-code">{coupon.code}</div>
                                    <div className="eligibility-badge">
                                        {getEligibilityIcon(coupon.eligibility)}
                                        {coupon.eligibility === 'applicable' ? 'Ready' : 
                                         coupon.eligibility === 'almost' ? 'Almost' : 'Not Eligible'}
                                    </div>
                                </div>
                                
                                <div className="coupon-content">
                                    <h3 className="coupon-title">{coupon.description}</h3>
                                    
                                    <div className="coupon-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Discount:</span>
                                            <span className="detail-value">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : 
                                                 coupon.type === 'fixed' ? `₹${coupon.value}` : 
                                                 `${coupon.value}% on categories`}
                                            </span>
                                        </div>
                                        
                                        <div className="detail-row">
                                            <span className="detail-label">Minimum Order:</span>
                                            <span className="detail-value">₹{coupon.minOrderValue}</span>
                                        </div>
                                        
                                        {coupon.maxDiscount && (
                                            <div className="detail-row">
                                                <span className="detail-label">Max Discount:</span>
                                                <span className="detail-value">₹{coupon.maxDiscount}</span>
                                            </div>
                                        )}
                                        
                                        <div className="detail-row">
                                            <span className="detail-label">Potential Savings:</span>
                                            <span className="detail-value highlight">
                                                ₹{coupon.potentialDiscount.toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {coupon.eligibility === 'almost' && coupon.amountNeeded > 0 && (
                                        <div className="amount-needed">
                                            <span className="need-icon">💡</span>
                                            <span>Add ₹{coupon.amountNeeded} more to unlock this offer!</span>
                                        </div>
                                    )}
                                    
                                    {coupon.eligibility === 'not_applicable' && (
                                        <div className="eligibility-reason">
                                            <span className="reason-icon">ℹ️</span>
                                            <span>{coupon.eligibilityReason}</span>
                                        </div>
                                    )}
                                    
                                    {coupon.applicableCategories.length > 0 && (
                                        <div className="applicable-categories">
                                            <span className="category-label">Valid for:</span>
                                            <div className="category-tags">
                                                {coupon.applicableCategories.map(cat => (
                                                    <span key={cat} className="category-tag">{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="coupon-expiry">
                                        <span className="expiry-label">Expires:</span>
                                        <span className="expiry-value">
                                            {coupon.daysUntilExpiry > 0 ? 
                                             `${coupon.daysUntilExpiry} days left` : 'Expired'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="coupon-actions">
                                    {coupon.eligibility === 'applicable' ? (
                                        <Link to="/cart" className="btn btn-primary coupon-apply-btn">
                                            🛒 Apply Now
                                        </Link>
                                    ) : (
                                        <button className="btn btn-outline" disabled>
                                            {coupon.eligibility === 'almost' ? '🛒 Add More Items' : '❌ Not Eligible'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredCoupons.length === 0 && (
                        <div className="no-offers">
                            <div className="no-offers-icon">🎁</div>
                            <h3>No offers available</h3>
                            <p>No offers found for the selected category. Try selecting a different category!</p>
                        </div>
                    )}
                </div>

                {/* How to Use */}
                <div className="how-to-use">
                    <h2 className="section-title">How to Use Coupons</h2>
                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Browse & Select</h3>
                                <p>Choose the products you want to buy and add them to your cart.</p>
                            </div>
                        </div>
                        
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Apply Coupon</h3>
                                <p>Enter the coupon code in the cart or checkout page to get your discount.</p>
                            </div>
                        </div>
                        
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Enjoy Savings</h3>
                                <p>Complete your order and enjoy the reduced total amount!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Offers;