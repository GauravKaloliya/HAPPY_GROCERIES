import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  useActivityLog('page_view', { section: 'categories' });

  // Sync selectedCategory with URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'All';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  // Fetch categories only once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await categoriesAPI.getAll();
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProducts([]); // Clear products before fetching new ones
      try {
        const productsRes = await productsAPI.getAll(selectedCategory === 'All' ? {} : { category: selectedCategory });
        setProducts(productsRes.data.results || productsRes.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const getCategoryEmoji = (name) => {
    const emojis = {
      'All': '🛒',
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Dairy': '🥛',
      'Snacks': '🍪',
      'Beverages': '🧃',
    };
    return emojis[name] || '📦';
  };

  const getCategoryColor = (name) => {
    const colors = {
      'All': 'var(--primary-pink)',
      'Fruits': 'var(--primary-pink)',
      'Vegetables': 'var(--primary-green)',
      'Dairy': 'var(--primary-blue)',
      'Snacks': 'var(--primary-yellow)',
      'Beverages': 'var(--primary-orange)',
    };
    return colors[name] || 'var(--primary-pink)';
  };

  const allCategories = [{ id: 'all', name: 'All', emoji: '🛒' }, ...categories];

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    // Update URL without page reload
    if (categoryName === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryName });
    }
  };

  if (categoriesLoading) return <PageLoader />;

  return (
    <div className="container">
      <h2 className="section-title">🎨 Shop by Category</h2>
      
      <div className="categories-grid">
        {allCategories.map((category) => (
          <button
            key={category.id || category.name}
            onClick={() => handleCategoryClick(category.name)}
            className="category-card"
            style={{
              background: getCategoryColor(category.name),
              border: selectedCategory === category.name ? '4px solid var(--text-dark)' : 'none',
              transform: selectedCategory === category.name ? 'scale(1.05)' : 'scale(1)',
              cursor: 'pointer'
            }}
          >
            <span className="category-emoji">{category.emoji || getCategoryEmoji(category.name)}</span>
            <h3>{category.name}</h3>
          </button>
        ))}
      </div>

      <h2 className="section-title">
        {selectedCategory === 'All' 
          ? '✨ All Products' 
          : `${getCategoryEmoji(selectedCategory)} ${selectedCategory}`}
      </h2>

      {productsLoading ? (
        <div className="products-loading" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading products...</p>
        </div>
      ) : products.length > 0 ? (
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
