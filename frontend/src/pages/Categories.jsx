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
      <div className="shop-layout categories-layout">
        <aside className="shop-sidebar categories-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">🎨 Shop by Category</h3>
            <div className="category-filters">
              {allCategories.map((category) => (
                <button
                  key={category.id || category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`category-filter-btn ${category.name === 'All' ? 'all-option' : ''} ${selectedCategory === category.name ? 'active' : ''}`}
                >
                  {category.emoji || getCategoryEmoji(category.name)} {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="shop-content">
          <h2 className="section-title">
            {selectedCategory === 'All'
              ? '✨ All Products'
              : `${getCategoryEmoji(selectedCategory)} ${selectedCategory}`}
          </h2>

          {productsLoading ? (
            <div className="products-loading">
              <div className="spinner"></div>
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
                <div className="view-more-wrapper">
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
      </div>
    </div>
  );
};

export default Categories;
