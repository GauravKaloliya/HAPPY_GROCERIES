import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { PageLoader } from '../components/LoadingSpinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await productsAPI.getAll({ limit: 8 });
        setFeaturedProducts(productsRes.data.results || productsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  const categories = [
    { name: 'Fruits', emoji: '🍎', color: 'var(--primary-pink)' },
    { name: 'Vegetables', emoji: '🥕', color: 'var(--primary-green)' },
    { name: 'Dairy', emoji: '🥛', color: 'var(--primary-blue)' },
    { name: 'Snacks', emoji: '🍪', color: 'var(--primary-yellow)' },
    { name: 'Beverages', emoji: '🧃', color: 'var(--primary-orange)' },
  ];

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
          <p className="hero-subtitle">Your favorite groceries delivered with love!</p>
          <Link to="/shop" className="btn-primary btn-hero">Shop Now</Link>
        </div>
      </section>

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
    </main>
  );
};

export default Home;
