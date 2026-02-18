import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/LoadingSpinner';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 8 });
        const items = (response.data.results || response.data).slice(0, 4);
        setWishlistItems(items);
      } catch {
        console.error('Error fetching wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <PageLoader />;

  if (wishlistItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">💝</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love and they'll appear here</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2 className="section-title">💝 My Wishlist</h2>
      
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
      </p>

      <div className="products-grid">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/shop" style={{ color: 'var(--primary-pink)', textDecoration: 'none', fontWeight: 600 }}>
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
