import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const PRODUCTS_LIMIT = 8;

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
      setProducts([]);
      try {
        const params = selectedCategory === 'All'
          ? { limit: PRODUCTS_LIMIT, offset: 0 }
          : { category: selectedCategory, limit: PRODUCTS_LIMIT, offset: 0 };
        const productsRes = await productsAPI.getAll(params);
        const results = productsRes.data.results || productsRes.data;
        setProducts(results);
        setTotalCount(productsRes.data.count ?? results.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, PRODUCTS_LIMIT]);

  const handleViewMore = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const params = selectedCategory === 'All'
        ? { limit: PRODUCTS_LIMIT, offset: products.length }
        : { category: selectedCategory, limit: PRODUCTS_LIMIT, offset: products.length };
      const productsRes = await productsAPI.getAll(params);
      const results = productsRes.data.results || productsRes.data;
      setProducts((prev) => [...prev, ...results]);
      setTotalCount((prev) => productsRes.data.count ?? prev);
    } catch (error) {
      console.error('Error fetching more products:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

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
    if (categoryName === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryName });
    }
  };

  const hasMoreProducts = products.length < totalCount;

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
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMoreProducts && (
            <div className="view-more-wrapper" style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
              <button
                className="btn-primary"
                onClick={handleViewMore}
                disabled={isFetchingMore}
              >
                {isFetchingMore ? 'Loading...' : 'View More'}
              </button>
            </div>
          )}
        </>
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
