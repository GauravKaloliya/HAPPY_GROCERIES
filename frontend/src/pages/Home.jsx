import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import { PageLoader } from '../components/LoadingSpinner';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import useActivityLog from '../hooks/useActivityLog';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSearch, setMobileSearch] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useActivityLog('page_view', { section: 'home' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getFeatured(),
          categoriesAPI.getAll(),
        ]);
        const productsData = productsRes.data.results || productsRes.data;
        setFeaturedProducts(Array.isArray(productsData) ? productsData.slice(0, 8) : []);
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryEmoji = (name) => {
    const emojis = {
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Dairy': '🥛',
      'Snacks': '🍪',
      'Beverages': '🧃',
    };
    return emojis[name] || '🛒';
  };

  if (loading) return <PageLoader />;

  return (
    <main>
      <section className="home-mobile">
        <div className="home-mobile-topbar">
          <div className="home-mobile-location">
            <span className="home-mobile-dot" />
            <span>Home</span>
            <span className="home-mobile-chevron">▾</span>
          </div>
          <button className="home-mobile-profile" aria-label="Profile">
            👤
          </button>
        </div>
        <div className="home-mobile-promo">
          <div>
            <p>Delivering to you in</p>
            <strong>7 mins</strong>
          </div>
          <span className="home-mobile-promo-emoji">🥕</span>
        </div>
        <div className="home-mobile-search">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/shop?search=${encodeURIComponent(mobileSearch)}`);
                }
              }}
              onBlur={(e) => setMobileSearch(e.target.value)}
              placeholder="Search"
            />
            {!mobileSearch && (
              <div className="search-placeholder" aria-hidden="true">
                <span className="search-placeholder-label">Search</span>
                <span className="search-placeholder-rotator">
                  <span className="rotator-track">
                    {['Apples', 'Bananas', 'Milk', 'Chips', 'Tomatoes'].map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="home-mobile-section">
          <div className="home-mobile-section-header">
            <h3>Trending Near You</h3>
            <Link to="/shop">See All</Link>
          </div>
          <p>We satisfy your daily needs</p>
          <div className="home-mobile-grid">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={`m-${product.id}`} product={product} />
            ))}
          </div>
        </div>
        <div className="home-mobile-section">
          <div className="home-mobile-section-header">
            <h3>Categories</h3>
            <Link to="/categories">See All</Link>
          </div>
          <div className="home-mobile-categories">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id || category.name}
                onClick={() => navigate(`/categories?category=${category.name}`)}
                className="home-mobile-category-card"
              >
                <span>{category.emoji || getCategoryEmoji(category.name)}</span>
                <strong>{category.name}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

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
          <p className="hero-subtitle">Your favorite groceries from Happy Groceries delivered with love!</p>
          <Link to="/shop" className="btn-primary btn-hero">Shop Now</Link>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="home-auth-banner">
          <div className="container home-auth-banner-wrap">
            <div className="home-auth-banner-copy">
              <span className="home-auth-banner-icon">🔒</span>
              <div className="home-auth-banner-text">
                <strong>Sign in to unlock all features</strong>
                <p>Save items to your wishlist, track orders, and get personalised deals</p>
              </div>
            </div>
            <div className="home-auth-banner-actions">
              <Link to="/login" className="btn-login">Log In</Link>
              <Link to="/signup" className="btn-signup">Sign Up Free</Link>
            </div>
          </div>
        </section>
      )}

      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">✨ Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="categories-preview">
        <div className="container">
          <h2 className="section-title">🎨 Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id || category.name}
                onClick={() => navigate(`/categories?category=${category.name}`)}
                className="category-card"
              >
                <span className="category-emoji">{category.emoji || getCategoryEmoji(category.name)}</span>
                <h3>{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
