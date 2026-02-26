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
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useActivityLog('page_view', { section: 'home' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({ limit: 8 }),
          categoriesAPI.getAll(),
        ]);
        setFeaturedProducts(productsRes.data.results || productsRes.data);
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

  const getCategoryColor = (name) => {
    const colors = {
      'Fruits': 'var(--primary-pink)',
      'Vegetables': 'var(--primary-green)',
      'Dairy': 'var(--primary-blue)',
      'Snacks': 'var(--primary-yellow)',
      'Beverages': 'var(--primary-orange)',
    };
    return colors[name] || 'var(--primary-pink)';
  };

  if (loading) return <PageLoader />;

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="floating-icons">
            <span className="float-icon" style={{ '--delay': '0s' }}>🍎</span>
            <span className="float-icon" style={{ '--delay': '1s' }}>🥕</span>
            <span className="float-icon" style={{ '--delay': '2s' }}>🛒</span>
            <span className="float-icon" style={{ '--delay': '0.5s' }}>🥛</span>
            <span className="float-icon" style={{ '--delay': '1.5s' }}>🍪</span>
            <span className="float-icon" style={{ '--delay': '2.5s' }}>🧃</span>
          </div>
          <h1 className="hero-title">Fresh & Happy 🛍️</h1>
          <p className="hero-subtitle">Your favorite groceries from Happy Groceries delivered with love!</p>
          <Link to="/shop" className="btn-primary btn-hero">Shop Now</Link>
        </div>
      </section>

      {/* Login Banner for unauthenticated users */}
      {!isAuthenticated && (
        <section style={{ background: 'var(--bg-white)', padding: '1.5rem 0', borderBottom: '2px solid var(--primary-pink)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🔒</span>
              <div>
                <strong style={{ color: 'var(--text-dark)', fontSize: '1rem' }}>Sign in to unlock all features</strong>
                <p style={{ color: 'var(--text-dark)', opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Save items to your wishlist, track orders, and get personalised deals</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn-login" style={{ padding: '0.5rem 1.25rem' }}>Log In</Link>
              <Link to="/signup" className="btn-signup" style={{ padding: '0.5rem 1.25rem' }}>Sign Up Free</Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
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

      {/* Categories */}
      <section className="categories-preview">
        <div className="container">
          <h2 className="section-title">🎨 Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id || category.name}
                onClick={() => navigate(`/categories?category=${category.name}`)}
                className="category-card"
                style={{
                  background: getCategoryColor(category.name),
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
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
