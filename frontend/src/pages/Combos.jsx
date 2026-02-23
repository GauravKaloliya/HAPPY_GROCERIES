import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useActivityLog from '../hooks/useActivityLog';

const Combos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useActivityLog('page_view', { section: 'combos' });

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await api.get('/api/products/combos/');
        setCombos(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching combos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const handleAddComboToCart = async (combo) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      // Add each product in the combo to the cart
      for (const product of combo.products) {
        await dispatch(addToCart({ productId: product.id, quantity: 1, product })).unwrap();
      }
      toast.success(`Added "${combo.name}" combo to cart! 🛒`);
    } catch (err) {
      toast.error(err || 'Failed to add combo to cart');
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.round(rating || 0);
    return (
      <span style={{ display: 'inline-flex', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={i <= fullStars ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            strokeWidth="1.5"
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </span>
    );
  };

  if (loading) return <PageLoader />;

  return (
    <div className="container">
      <div className="combos-header" style={{
        background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-blue))',
        padding: '2rem',
        borderRadius: 'var(--border-radius)',
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁 Product Combos</h1>
        <p style={{ opacity: 0.9 }}>Save more when you buy together! Exclusive combo deals just for you.</p>
      </div>

      {combos.length > 0 ? (
        <div className="combos-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {combos.map((combo) => (
            <div key={combo.id} className="combo-card" style={{
              background: 'var(--bg-white)',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow)',
              overflow: 'hidden',
              transition: 'var(--transition)'
            }}>
              <div className="combo-header" style={{
                background: 'linear-gradient(135deg, var(--primary-green), var(--primary-yellow))',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{combo.name}</h3>
                <span style={{
                  background: 'var(--primary-pink)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {combo.discount_percent}% OFF
                </span>
              </div>

              <div className="combo-products" style={{ padding: '1rem' }}>
                {combo.products.map((product, index) => (
                  <div key={product.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: 'var(--bg-light)',
                    borderRadius: '10px',
                    marginBottom: index < combo.products.length - 1 ? '0.5rem' : 0
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      background: 'var(--bg-white)',
                      borderRadius: '10px'
                    }}>
                      {product.emoji || '📦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {product.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {renderStars(product.rating)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', opacity: 0.7 }}>
                          ({product.rating})
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="combo-footer" style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.9rem' }}>
                      {formatPrice(combo.original_price)}
                    </span>
                    <span style={{
                      background: 'var(--primary-green)',
                      color: 'white',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      Save {formatPrice(combo.savings)}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-pink)' }}>
                    {formatPrice(combo.discounted_price)}
                  </span>
                </div>
                <button
                  onClick={() => handleAddComboToCart(combo)}
                  className="btn-add-cart"
                  style={{
                    padding: '0.75rem 1.5rem',
                    minWidth: 'auto'
                  }}
                >
                  Add Combo to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎁</div>
          <h3>No combos available</h3>
          <p>Check back later for amazing combo deals!</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default Combos;
