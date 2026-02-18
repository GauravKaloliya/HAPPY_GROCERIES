import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/UI/ProductCard';
import { wishlistAPI } from '../services/api';
import { showToast } from '../components/UI/Toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlist(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
      showToast('Removed from wishlist');
    } catch (error) {
      showToast('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">💖</div>
          <h3>Your wishlist is empty</h3>
          <p>Save your favorite products here!</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">💖 Your Wishlist ({wishlist.products.length} items)</h1>

      <div className="products-grid">
        {wishlist.products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={true}
            onWishlistToggle={handleWishlistToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
