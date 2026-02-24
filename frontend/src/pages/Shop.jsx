import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import { selectSortOptions } from '../store/slices/configSlice';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const PRODUCTS_PER_PAGE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { logCustomActivity } = useActivityLog('page_view', { section: 'shop' });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const sortOptions = useSelector(selectSortOptions);

  // Filter states
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');

  const placeholderItems = ['Apples', 'Bananas', 'Milk', 'Chips', 'Tomatoes'];

  // Fetch categories only once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await categoriesAPI.getAll();
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoaded(true);
      }
    };
    
    if (!categoriesLoaded) {
      fetchCategories();
    }
  }, [categoriesLoaded]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        ordering: sortBy,
        min_price: minPrice,
        max_price: maxPrice,
        in_stock: inStock ? 'true' : undefined,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const productsRes = await productsAPI.getAll(params);

      setProducts(productsRes.data.results || productsRes.data);
      setTotalCount(productsRes.data.count || productsRes.data.length);
      setCurrentPage(1);

      // Log search/filter activity
      if (searchQuery) {
        logCustomActivity('search', { query: searchQuery });
      }
      if (selectedCategory) {
        logCustomActivity('filter_apply', { type: 'category', value: selectedCategory });
      }
      if (sortBy) {
        logCustomActivity('filter_apply', { type: 'sort', value: sortBy });
      }
      if (minPrice || maxPrice) {
        logCustomActivity('filter_apply', { type: 'price_range', min: minPrice, max: maxPrice });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, inStock, logCustomActivity]);

  // Debounce search to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (sortBy) params.sort = sortBy;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStock) params.in_stock = 'true';

    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, inStock]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const hasFilters = searchQuery || (selectedCategory && selectedCategory !== 'All') || sortBy || minPrice || maxPrice || inStock;

  if (loading && products.length === 0) return <PageLoader />;

  return (
    <div className="container">
      {/* Mobile Filter Button */}
      <button
        className="mobile-filter-btn"
        onClick={() => setShowMobileFilters(true)}
      >
        🔍 Filters & Sort
        {hasFilters && <span className="mobile-filter-badge">{products.length}</span>}
      </button>

      <div className="shop-layout">
        <aside className={`shop-sidebar ${showMobileFilters ? 'show' : ''}`}>
          <div className="mobile-filter-header">
            <h3 className="mobile-filter-title">Filters</h3>
            <button
              className="mobile-filter-close"
              onClick={() => setShowMobileFilters(false)}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Search</h3>
            <div className="search-bar">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchQuery(e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Search"
                />
                {!searchInput && (
                  <div className="search-placeholder" aria-hidden="true">
                    <span className="search-placeholder-label">Search</span>
                    <span className="search-placeholder-rotator">
                      <span className="rotator-track">
                        {placeholderItems.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <div className="category-filters">
              <button
                onClick={() => setSelectedCategory('')}
                className={`category-filter-btn ${!selectedCategory ? 'active' : ''}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`category-filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Price Range</h3>
            <div className="price-filters">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                min="0"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) setMinPrice(val);
                }}
                className="price-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                min="0"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) setMaxPrice(val);
                }}
                className="price-input"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">Default</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Availability</h3>
            <label className="stock-filter">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              In Stock Only
            </label>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-clear-all"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div
            className="mobile-filter-overlay"
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        <div className="shop-content">
          <div className="results-header">
            <p className="results-count">{totalCount} products found</p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="products-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                    style={{ minWidth: 'unset', padding: '0.5rem 1rem' }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'btn-primary' : 'btn-secondary'}
                      style={{ minWidth: 'unset', padding: '0.5rem 0.9rem' }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                    style={{ minWidth: 'unset', padding: '0.5rem 1rem' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary" style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
