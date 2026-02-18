import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { PageLoader } from '../components/LoadingSpinner';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  const categories = [
    { name: 'All', emoji: '🛒', color: 'var(--primary-pink)' },
    { name: 'Fruits', emoji: '🍎', color: 'var(--primary-pink)' },
    { name: 'Vegetables', emoji: '🥕', color: 'var(--primary-green)' },
    { name: 'Dairy', emoji: '🥛', color: 'var(--primary-blue)' },
    { name: 'Snacks', emoji: '🍪', color: 'var(--primary-yellow)' },
    { name: 'Beverages', emoji: '🧃', color: 'var(--primary-orange)' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = selectedCategory === 'All' ? {} : { category: selectedCategory };
        const response = await productsAPI.getAll(params);
        setProducts(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  if (loading) return <PageLoader />;

  return (
    <div className="container">
      <h2 className="section-title">🎨 Shop by Category</h2>
      
      <div className="categories-grid">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className="category-card"
            style={{ 
              background: category.color,
              border: selectedCategory === category.name ? '4px solid var(--text-dark)' : 'none',
              transform: selectedCategory === category.name ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span className="category-emoji">{category.emoji}</span>
            <h3>{category.name}</h3>
          </button>
        ))}
      </div>

      <h2 className="section-title">
        {selectedCategory === 'All' ? '✨ All Products' : `${categories.find(c => c.name === selectedCategory)?.emoji} ${selectedCategory}`}
      </h2>

      {products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No products found</h3>
          <p>This category is currently empty</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
