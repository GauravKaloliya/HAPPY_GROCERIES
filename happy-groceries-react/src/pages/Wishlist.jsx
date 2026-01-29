import React from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css';

const Wishlist = () => {
    // For now, showing empty state as wishlist functionality will be implemented later
    const wishlistItems = []; // This would come from user context/API in real implementation

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="container">
                    <div className="empty-wishlist">
                        <div className="empty-wishlist-icon">💝</div>
                        <h2 className="empty-wishlist-title">Your wishlist is empty</h2>
                        <p className="empty-wishlist-message">
                            Save items you love to view them here later.
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
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1 className="wishlist-title">My Wishlist</h1>
                    <p className="wishlist-subtitle">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                
                <div className="wishlist-content">
                    {/* Wishlist items would be rendered here */}
                    <p>Wishlist functionality coming soon!</p>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;