import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/UI/ProductCard';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { wishlistAPI } from '../services/api';
import { showToast } from '../components/UI/Toast';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedProducts();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getFeatured();
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlist(response.data.products.map(p => p.id));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleWishlistToggle = async (productId) => {
    if (!isAuthenticated) {
      showToast('Please login to use wishlist');
      return;
    }

    try {
      const response = await wishlistAPI.toggle(productId);
      if (response.data.action === 'added') {
        setWishlist([...wishlist, productId]);
        showToast('Added to wishlist 💖');
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
        showToast('Removed from wishlist');
      }
    } catch (error) {
      showToast('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const categories = [
    { name: 'Fruits', emoji: '🍎', color: 'var(--primary-pink)' },
    { name: 'Vegetables', emoji: '🥕', color: 'var(--primary-green)' },
    { name: 'Dairy', emoji: '🥛', color: 'var(--primary-blue)' },
    { name: 'Snacks', emoji: '🍪', color: 'var(--primary-yellow)' },
    { name: 'Beverages', emoji: '🧃', color: 'var(--primary-orange)' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="floating-icons">
            <span className="float-icon">🍎</span>
            <span className="float-icon">🥕</span>
            <span className="float-icon">🛒</span>
            <span className="float-icon">🥛</span>
            <span className="float-icon">🍪</span>
            <span className="float-icon">🧃</span>
          </div>
          <h1 className="hero-title">Fresh & Happy 🛍️</h1>
          <p className="hero-subtitle">Your favorite groceries delivered with love!</p>
          <Link to="/shop" className="btn-primary btn-hero">Shop Now</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">✨ Featured Products</h2>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={isInWishlist(product.id)}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-preview">
        <div className="container">
          <h2 className="section-title">🎨 Shop by Category</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link
                key={category.name}
                to={`/categories?category=${category.name}`}
                className="category-card"
                style={{ background: category.color }}
              >
                <span className="category-emoji">{category.emoji}</span>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
